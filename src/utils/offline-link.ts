import { getSession, isAnonymous } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient, ApolloError, MutationOptions } from "apollo-client";
import { ApolloLink, NextLink, Observable, Operation } from "apollo-link";
import gql from "graphql-tag";
import Type from "models/type";
import { InteractionManager } from "react-native";
import dataIdFromObject from "utils/data-id-from-object";
import defaultId from "utils/default-id";
import { IEnvConfig } from "utils/env-config";
import makeLog from "utils/make-log";

interface IOfflineLinkOperationContext {
    enqueue?: boolean;
    isOfflineOperation?: boolean;
    optimisticResponse?: object;
}

interface IOfflineOperation {
    __typename: Type;
    body: string;
    date: number;
    name: string;
    variables: Array<{
        __typename: Type;
        name: string;
        value: any;
    }>;
}

interface IOfflineOperationsFragment {
    __typename: Type;
    hasOperations: boolean;
    operations: IOfflineOperation[];
}

interface ISessionFragment {
    accessToken?: string;
    userId?: string;
}

interface IGetDataResponse {
    offline: {
        isOnline?: boolean;
    };
    session: ISessionFragment;
}

const log = makeLog("offline-link");

const getDataQuery = gql`
query GetData {
    offline @client {
        isOnline
    }
    session @client {
        accessToken
        userId
    }
}`;

const offlineOperationsFragment = gql`
fragment OfflineLinkOperationsFragment on Offline {
    hasOperations
    operations {
        body
        date
        name
        variables {
            name
            value
        }
    }
}`;

const offlineFragmentId =
    dataIdFromObject({ __typename: Type.Offline, id: defaultId })!;

class OfflineLink extends ApolloLink {
    private isOnline?: boolean;
    private isDraining = false;
    private apollo?: ApolloClient<NormalizedCacheObject>;
    private session: ISessionFragment = {};
    private envConfig: IEnvConfig;

    public constructor(envConfig: IEnvConfig) {
        super();
        this.envConfig = envConfig;
    }

    public request(operation: Operation, forward?: NextLink) {
        const { optimisticResponse, isOfflineOperation, enqueue } =
            operation.getContext() as IOfflineLinkOperationContext;

        if (!isOfflineOperation
            && optimisticResponse
            && this.apollo
            && (this.isOnline === false
                || this.isDraining
                || isAnonymous(this.session)
                || enqueue)
        ) {
            InteractionManager.runAfterInteractions(
                () => this.enqueue(operation));
            return Observable.of({ data: optimisticResponse });
        }

        return forward!(operation);
    }

    public start(apollo: ApolloClient<NormalizedCacheObject>) {
        this.apollo = apollo;
        this.listenNetworkAndSession();
    }

    private listenNetworkAndSession() {
        this.apollo!.watchQuery<IGetDataResponse>({
            fetchPolicy: "cache-only", query: getDataQuery,
        }).subscribe((result) => {
            const { offline, session } = result.data;
            this.isOnline = offline.isOnline;
            this.session = session;
            this.tryDrainQueue();
        });
    }

    private tryDrainQueue() {
        InteractionManager.runAfterInteractions(() => {
            if (!this.isDraining
                && this.isOnline
                && this.session.accessToken
                && this.apollo
            ) {
                this.drainQueue();
            }
        });
    }

    private enqueue(operation: Operation) {
        log.trace("enqueue", "operation=%o", operation);
        const fragment = this.loadFragment();
        const variables = [];

        if (operation.variables) {
            // tslint:disable-next-line:forin
            for (const varName in operation.variables) {
                variables.push({
                    __typename: Type.OfflineOperationVariable,
                    name: varName,
                    value: operation.variables[varName],
                });
            }
        }

        fragment.operations.push({
            __typename: Type.OfflineOperation,
            body: operation.query.loc!.source.body,
            date: Date.now(),
            name: operation.operationName,
            variables,
        });
        this.saveFragment(fragment);
    }

    private async drainQueue() {
        let fragment = this.loadFragment();
        const operation = fragment.operations[0];
        log.trace("drainQueue", "operation=%o", operation);

        if (!operation) {
            return;
        }

        this.isDraining = true;
        const variables: { [name: string]: any } = {};

        for (const variable of operation.variables) {
            variables[variable.name] = variable.value;
        }

        const operationOptions: MutationOptions = {
            context: { isOfflineOperation: true },
            fetchPolicy: "no-cache",
            mutation: gql`${operation.body}`,
            variables,
        };

        if (!await this.runOperation(operationOptions)) {
            this.isDraining = false;
            return;
        }

        // get fragment again because it could be modified (e.g. by enqueue)
        // when mutation was executing
        fragment = this.loadFragment();
        fragment.operations.shift();
        this.saveFragment(fragment);
        this.isDraining = false;
        this.tryDrainQueue();
    }

    private async runOperation(
        options: MutationOptions,
        startDate = Date.now(),
        retryDelay = 2048,
        retryCount = 0,
    ): Promise<boolean> {
        try {
            await this.apollo!.mutate(options);
        } catch (e) {
            if (!this.isOnline || !this.session.accessToken) {
                log.trace("runOperation", "stop");
                return false;
            }

            const apolloError: ApolloError = e;
            const networkError: any = apolloError.networkError;
            const status: number | undefined = networkError
                && networkError.response
                && networkError.response.status;

            if (status) {
                if (status >= 400 && status < 500 && status !== 401) {
                    log.error("runOperation", "Client error");
                    return true;
                } else if (status >= 500
                    && startDate + this.envConfig.syncRetryTimeout <= Date.now()
                ) {
                    log.error("runOperation", "Retry timeout");
                    return true;
                }
            }

            await this.wait(retryDelay);
            return await this.runOperation(
                options, startDate, retryDelay * 2, ++retryCount);
        }

        return true;
    }

    private wait(duration: number) {
        log.trace("wait", "duration=%o", duration);
        return new Promise((resolve) => setTimeout(resolve, duration));
    }

    private loadFragment() {
        return this.apollo!.readFragment<IOfflineOperationsFragment>(
            { fragment: offlineOperationsFragment, id: offlineFragmentId })!;
    }

    private saveFragment(fragment: IOfflineOperationsFragment) {
        const operationCount = fragment.operations.length;
        log.trace("saveFragment", "operationCount=%o", operationCount);
        fragment.hasOperations = operationCount > 0;
        this.apollo!.writeFragment({
            data: fragment,
            fragment: offlineOperationsFragment,
            id: offlineFragmentId,
        });
    }
}

export { IOfflineLinkOperationContext };
export default OfflineLink;

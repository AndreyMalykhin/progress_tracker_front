import { ApolloError, isApolloError } from "apollo-client/errors/ApolloError";
import { NextLink, Observable, Operation } from "apollo-link";
import { ErrorHandler, ErrorLink as ErrorLinkImpl } from "apollo-link-error";
import makeLog from "utils/make-log";
import { IOfflineLinkOperationContext } from "utils/offline-link";

interface IOperationContext extends IOfflineLinkOperationContext {
    res?: Response;
}

const log = makeLog("error-link");

class ErrorLink extends ErrorLinkImpl {
    private listeners: ErrorHandler[] = [];

    public constructor() {
        super((error) => {
            for (const listener of this.listeners) {
                listener(error);
            }
        });
    }

    public request(operation: Operation, forward: NextLink) {
        return new Observable((subscriber) => {
            const onRetry = () => {
                subscription =
                    this.doRequest(operation, forward, subscriber);
            };
            let subscription =
                this.doRequest(operation, forward, subscriber, onRetry);
            return () => subscription && subscription.unsubscribe();
        });
    }

    public subscribe(listener: ErrorHandler) {
        this.listeners.push(listener);
    }

    private doRequest(
        operation: Operation,
        forward: NextLink,
        subscriber: ZenObservable.SubscriptionObserver<{}>,
        onRetry?: () => void,
    ) {
        return super.request(operation, forward)!.subscribe({
            complete: () => subscriber.complete(),
            error: (e) => {
                if (this.isMutation(operation)) {
                    if (onRetry) {
                        const context = operation.getContext() as
                            IOperationContext;
                        const response = context.res || e.response;
                        const httpStatus: number | undefined =
                            response && response.status;

                        if (context.optimisticResponse && !httpStatus) {
                            context.enqueue = true;
                            operation.setContext(context);
                            log.trace("doRequest", "retry");
                            onRetry();
                            return;
                        }
                    }

                    subscriber.error(e);
                    return;
                }

                // treat all kinf of errors as GraphQL errors to mitigate
                // error handling bugs in Apollo
                subscriber.next({ errors: [{ message: "dummy" }] });
                subscriber.complete();
            },
            next: (value) => subscriber.next(value),
        });
    }

    private isMutation(operation: Operation) {
        for (const definition of operation.query.definitions) {
            if (definition.kind === "OperationDefinition"
                && definition.operation === "mutation"
            ) {
                return true;
            }
        }

        return false;
    }
}

export default ErrorLink;

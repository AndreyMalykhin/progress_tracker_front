import { ApolloError, isApolloError } from "apollo-client/errors/ApolloError";
import { NextLink, Observable, Operation } from "apollo-link";
import { ErrorHandler, ErrorLink as ErrorLinkImpl } from "apollo-link-error";
import makeLog from "utils/make-log";
import { IOfflineLinkOperationContext } from "utils/offline-link";

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
                log.trace("request", "retry");
                const context = operation.getContext() as
                    IOfflineLinkOperationContext;
                context.enqueue = true;
                operation.setContext(context);
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
                        onRetry!();
                        return;
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

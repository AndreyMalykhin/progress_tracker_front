import { getSession, isAnonymous } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import { ApolloLink, Observable, Operation } from "apollo-link";
import {
    checkDocument,
    getDirectiveInfoFromField,
    getDirectiveNames,
    RemoveDirectiveConfig,
    removeDirectivesFromDocument,
} from "apollo-utilities";
import { DocumentNode, OperationDefinitionNode } from "graphql";

interface IContext {
    optimisticResponse?: object;
    cache: DataProxy;
}

const AnonymousLink = new ApolloLink((operation, forward) => {
    const { optimisticResponse, cache } = operation.getContext() as IContext;

    if (isAnonymous(getSession(cache))) {
        if (optimisticResponse) {
            return Observable.of({ data: optimisticResponse });
        }
    }

    return forward!(operation);
});

export default AnonymousLink;

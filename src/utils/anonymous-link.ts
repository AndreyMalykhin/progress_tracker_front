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

interface IDocumentCahe {
    [directive: string]: Map<DocumentNode, DocumentNode>;
}

const documentCache: IDocumentCahe = {
    anonymous: new Map(),
    client: new Map(),
};

const AnonymousLink = new ApolloLink((operation, forward) => {
    const { optimisticResponse, cache } = operation.getContext() as IContext;

    if (isAnonymous(getSession(cache))) {
        if (optimisticResponse) {
            return Observable.of({ data: optimisticResponse });
        }
    }

    return forward!(operation);
});

function isMyDataQuery(operation: Operation, myId?: string) {
    for (const definition of operation.query.definitions) {
        if (definition.kind !== "OperationDefinition") {
            continue;
        }

        const { selectionSet } = definition as OperationDefinitionNode;
        for (const selection of selectionSet.selections) {
            if (selection.kind !== "Field") {
                continue;
            }

            const directives = getDirectiveInfoFromField(
                selection, operation.variables);

            if (directives
                && directives.anonymous
                && (!directives.anonymous.userId
                    || directives.anonymous.userId === myId)
            ) {
                return true;
            }
        }
    }

    return false;
}

function removeDirective(name: string, doc: DocumentNode) {
    checkDocument(doc);
    const cachedDoc = documentCache[name].get(doc);

    if (cachedDoc) {
        return cachedDoc;
    }

    const newDoc = removeDirectivesFromDocument([{ name }], doc)!;
    documentCache[name].set(doc, newDoc);
    return newDoc;
}

export default AnonymousLink;

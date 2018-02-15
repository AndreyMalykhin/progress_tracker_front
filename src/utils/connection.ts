import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import Type from "models/type";

interface IConnection<TNode, TCursor> {
    __typename?: Type;
    edges: Array<{
        cursor: TCursor;
        node: TNode;
    }>;
    pageInfo: {
        hasNextPage: boolean;
        endCursor?: TCursor;
    };
}

interface ISpliceConnectionFragment {
    __typename: Type;
    id: string;
    [field: string]: any;
}

function spliceConnection<TNode extends ISpliceConnectionFragment, TCursor>(
    connection: IConnection<TNode, TCursor>,
    idsToRemove: string[],
    objectsToAdd: TNode[],
    cursorField: keyof TNode,
    edgeType: Type,
    comparator: (lhs: TNode, rhs: TNode) => number,
) {
    const { edges } = connection;

    if (idsToRemove.length) {
        for (let i = edges.length - 1; i >= 0; --i) {
            if (idsToRemove.indexOf(edges[i].node.id) !== -1) {
                edges.splice(i, 1);
            }
        }
    }

    if (objectsToAdd.length) {
        const edgesToAdd = objectsToAdd.map((object) => {
            return {
                __typename: edgeType,
                cursor: object[cursorField],
                node: object,
            };
        });
        edges.push(...edgesToAdd);
    }

    sortConnection(connection, cursorField, comparator);
}

function sortConnection<TNode extends ISpliceConnectionFragment, TCursor>(
    connection: IConnection<TNode, TCursor>,
    cursorField: keyof TNode,
    comparator: (lhs: TNode, rhs: TNode) => number,
) {
    connection.edges.sort((lhs, rhs) => comparator(lhs.node, rhs.node));
    const { edges, pageInfo } = connection;

    for (const edge of edges) {
        edge.cursor = edge.node[cursorField];
    }

    pageInfo.endCursor =
        edges.length ? edges[edges.length - 1].cursor : undefined;
}

export {
    IConnection,
    spliceConnection,
    sortConnection,
    ISpliceConnectionFragment,
};

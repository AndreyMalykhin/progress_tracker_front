import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import Type from "models/type";

interface IConnection<TNode, TCursor> {
    __typename?: Type;
    edges: Array<{
        __typename: Type;
        cursor: TCursor;
        node: TNode;
    }>;
    pageInfo: {
        __typename: Type;
        hasNextPage: boolean;
        endCursor?: TCursor|null;
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
    objectsToPrepend: TNode[],
    objectsToAppend: TNode[],
    cursorField: (keyof TNode) | ((node: TNode) => TCursor),
    edgeType: Type,
    sort: boolean = false,
    comparator?: (lhs: TNode, rhs: TNode) => number,
) {
    const { edges } = connection;

    if (idsToRemove.length) {
        for (let i = edges.length - 1; i >= 0; --i) {
            if (idsToRemove.indexOf(edges[i].node.id) !== -1) {
                edges.splice(i, 1);
            }
        }
    }

    if (objectsToPrepend.length) {
        const edgesToPrepend = objectsToPrepend.map((object) => {
            return {
                __typename: edgeType,
                cursor: typeof cursorField === "function" ? cursorField(object)
                    : object[cursorField],
                node: object,
            };
        });
        edges.unshift(...edgesToPrepend);
    }

    if (objectsToAppend.length) {
        const edgesToAppend = objectsToAppend.map((object) => {
            return {
                __typename: edgeType,
                cursor: typeof cursorField === "function" ? cursorField(object)
                    : object[cursorField],
                node: object,
            };
        });
        edges.push(...edgesToAppend);
    }

    if (sort) {
        sortConnection(connection, cursorField, comparator!);
        return;
    }

    connection.pageInfo.endCursor =
        edges.length ? edges[edges.length - 1].cursor : null;
}

function sortConnection<TNode extends ISpliceConnectionFragment, TCursor>(
    connection: IConnection<TNode, TCursor>,
    cursorField: (keyof TNode) | ((node: TNode) => TCursor),
    comparator: (lhs: TNode, rhs: TNode) => number,
) {
    connection.edges.sort((lhs, rhs) => comparator(lhs.node, rhs.node));
    const { edges, pageInfo } = connection;

    for (const edge of edges) {
        edge.cursor = typeof cursorField === "function" ?
            cursorField(edge.node) : edge.node[cursorField];
    }

    pageInfo.endCursor =
        edges.length ? edges[edges.length - 1].cursor : null;
}

export {
    IConnection,
    spliceConnection,
    sortConnection,
    ISpliceConnectionFragment,
};

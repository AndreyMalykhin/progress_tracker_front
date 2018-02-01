import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import Type from "models/type";
import myId from "utils/my-id";

interface ISpliceActiveTrackablesFragment {
    __typename: Type;
    id: string;
    order: number;
}

interface IGetActiveTrackablesResponse {
    getActiveTrackables: {
        edges: Array<{
            cursor: number;
            node: {
                id: string;
                order: number;
            };
        }>;
        pageInfo: {
            endCursor?: number;
        };
    };
}

const getActiveTrackablesQuery = gql`
query GetActiveTrackables($userId: ID!) {
    getActiveTrackables(
        userId: $userId
    ) @connection(key: "getActiveTrackables", filter: ["userId"]) {
        edges {
            cursor
            node {
                id
                order
            }
        }
        pageInfo {
            endCursor
        }
    }
}`;

function spliceActiveTrackables(
    idsToRemove: string[],
    trackablesToAdd: ISpliceActiveTrackablesFragment[],
    apollo: DataProxy,
) {
    const activeTrackablesResponse = getActiveTrackables(apollo);
    const activeTrackables =
        activeTrackablesResponse.getActiveTrackables.edges;

    if (idsToRemove.length) {
        for (let i = activeTrackables.length - 1; i >= 0; --i) {
            if (idsToRemove.indexOf(activeTrackables[i].node.id) !== -1) {
                activeTrackables.splice(i, 1);
            }
        }
    }

    if (trackablesToAdd.length) {
        const edgesToAdd = trackablesToAdd.map((trackable) => {
            return {
                __typename: Type.TrackableEdge,
                cursor: trackable.order,
                node: trackable,
            };
        });
        activeTrackables.push(...edgesToAdd);
    }

    updateOrder(activeTrackablesResponse);
    setActiveTrackables(activeTrackablesResponse, apollo);
}

function updateActiveTrackablesOrder(apollo: DataProxy) {
    const activeTrackablesResponse = getActiveTrackables(apollo);
    updateOrder(activeTrackablesResponse);
    setActiveTrackables(activeTrackablesResponse, apollo);
}

function getActiveTrackables(apollo: DataProxy) {
    return apollo.readQuery<IGetActiveTrackablesResponse>({
        query: getActiveTrackablesQuery,
        variables: { userId: myId },
    })!;
}

function setActiveTrackables(
    activeTrackablesResponse: IGetActiveTrackablesResponse, apollo: DataProxy,
) {
    apollo.writeQuery({
        data: activeTrackablesResponse,
        query: getActiveTrackablesQuery,
        variables: { userId: myId },
    });
}

function updateOrder(activeTrackablesResponse: IGetActiveTrackablesResponse) {
    activeTrackablesResponse.getActiveTrackables.edges.sort((lhs, rhs) => {
        const result = rhs.node.order - lhs.node.order;

        if (result === 0) {
            return 0;
        }

        return result < 0 ? -1 : 1;
    });
    updateCursors(activeTrackablesResponse);
}

function updateCursors(activeTrackablesResponse: IGetActiveTrackablesResponse) {
    const { edges, pageInfo } = activeTrackablesResponse.getActiveTrackables;

    for (const edge of edges) {
        edge.cursor = edge.node.order;
    }

    pageInfo.endCursor =
        edges.length ? edges[edges.length - 1].cursor : undefined;
}

export {
    spliceActiveTrackables,
    updateActiveTrackablesOrder,
    getActiveTrackables,
    ISpliceActiveTrackablesFragment,
};

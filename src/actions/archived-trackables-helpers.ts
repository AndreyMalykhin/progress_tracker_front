import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import makeLog from "utils/make-log";
import myId from "utils/my-id";

const log = makeLog("archived-trackables-helpers");

interface ISpliceArchivedTrackablesFragment {
    __typename: Type;
    id: string;
    statusChangeDate: number;
}

interface IGetActiveTrackablesResponse {
    getArchivedTrackables: {
        edges: Array<{
            cursor: number;
            node: {
                id: string;
                statusChangeDate: number;
            };
        }>;
        pageInfo: {
            endCursor?: number;
        };
    };
}

const getArchivedTrackablesQuery = gql`
query GetArchivedTrackables($userId: ID!, $status: TrackableStatus!) {
    getArchivedTrackables(
        userId: $userId, status: $status
    ) @connection(key: "getArchivedTrackables", filter: ["userId", "status"]) {
        edges {
            cursor
            node {
                id
                statusChangeDate
            }
        }
        pageInfo {
            endCursor
        }
    }
}`;

function spliceArchivedTrackables(
    idsToRemove: string[],
    trackablesToAdd: ISpliceArchivedTrackablesFragment[],
    status: TrackableStatus,
    apollo: DataProxy,
) {
    const archivedTrackablesResponse = getArchivedTrackables(status, apollo);

    if (!archivedTrackablesResponse) {
        return;
    }

    const archivedTrackables =
        archivedTrackablesResponse.getArchivedTrackables.edges;

    if (idsToRemove.length) {
        for (let i = archivedTrackables.length - 1; i >= 0; --i) {
            if (idsToRemove.indexOf(archivedTrackables[i].node.id) !== -1) {
                archivedTrackables.splice(i, 1);
            }
        }
    }

    if (trackablesToAdd.length) {
        const edgesToAdd = trackablesToAdd.map((trackable) => {
            return {
                __typename: Type.TrackableEdge,
                cursor: trackable.statusChangeDate,
                node: trackable,
            };
        });
        archivedTrackables.push(...edgesToAdd);
    }

    updateOrder(archivedTrackablesResponse);
    setArchivedTrackables(archivedTrackablesResponse, status, apollo);
}

function getArchivedTrackables(status: TrackableStatus, apollo: DataProxy) {
    try {
        return apollo.readQuery<IGetActiveTrackablesResponse>({
            query: getArchivedTrackablesQuery,
            variables: { userId: myId, status },
        })!;
    } catch (e) {
        log("getArchivedTrackables(); error=%o", e);
        return null;
    }
}

function setArchivedTrackables(
    archivedTrackablesResponse: IGetActiveTrackablesResponse,
    status: TrackableStatus,
    apollo: DataProxy,
) {
    apollo.writeQuery({
        data: archivedTrackablesResponse,
        query: getArchivedTrackablesQuery,
        variables: { userId: myId, status },
    });
}

function updateOrder(archivedTrackablesResponse: IGetActiveTrackablesResponse) {
    archivedTrackablesResponse.getArchivedTrackables.edges.sort((lhs, rhs) => {
        const result = rhs.node.statusChangeDate - lhs.node.statusChangeDate;

        if (result === 0) {
            return 0;
        }

        return result < 0 ? -1 : 1;
    });
    updateCursors(archivedTrackablesResponse);
}

function updateCursors(
    archivedTrackablesResponse: IGetActiveTrackablesResponse,
) {
    const { edges, pageInfo } =
        archivedTrackablesResponse.getArchivedTrackables;

    for (const edge of edges) {
        edge.cursor = edge.node.statusChangeDate;
    }

    pageInfo.endCursor =
        edges.length ? edges[edges.length - 1].cursor : undefined;
}

export {
    spliceArchivedTrackables,
    getArchivedTrackables,
    ISpliceArchivedTrackablesFragment,
};

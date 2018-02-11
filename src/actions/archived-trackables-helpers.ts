import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { IConnection, spliceConnection } from "utils/connection";
import makeLog from "utils/make-log";
import myId from "utils/my-id";

const log = makeLog("archived-trackables-helpers");

interface ISpliceArchivedTrackablesFragment {
    __typename: Type;
    id: string;
    statusChangeDate: number;
}

interface IGetActiveTrackablesResponse {
    getArchivedTrackables:
        IConnection<ISpliceArchivedTrackablesFragment, number>;
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

    const cursorField = "statusChangeDate";
    spliceConnection(
        archivedTrackablesResponse.getArchivedTrackables,
        idsToRemove,
        trackablesToAdd,
        cursorField,
        Type.TrackableEdge,
        compareTrackables,
    );
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

function compareTrackables(
    lhs: ISpliceArchivedTrackablesFragment,
    rhs: ISpliceArchivedTrackablesFragment,
) {
    const result = rhs.statusChangeDate - lhs.statusChangeDate;

    if (result === 0) {
        return 0;
    }

    return result < 0 ? -1 : 1;
}

export {
    spliceArchivedTrackables,
    getArchivedTrackables,
    ISpliceArchivedTrackablesFragment,
};

import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { IConnection, spliceConnection } from "utils/connection";
import makeLog from "utils/make-log";

const log = makeLog("archived-trackables-helpers");

interface ISpliceArchivedTrackablesFragment {
    __typename: Type;
    id: string;
    statusChangeDate: number;
}

interface IGetArchivedTrackablesResponse {
    getArchivedTrackables:
        IConnection<ISpliceArchivedTrackablesFragment, string>;
}

const getArchivedTrackablesQuery = gql`
query GetArchivedTrackables($status: TrackableStatus!, $userId: ID) {
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

const initArchivedTrackablesQuery = gql`
query GetArchivedTrackables($status: TrackableStatus!, $userId: ID) {
    getArchivedTrackables(
        userId: $userId, status: $status
    ) @connection(key: "getArchivedTrackables", filter: ["userId", "status"]) {
        edges {
            cursor
        }
        pageInfo {
            endCursor
            hasNextPage
        }
    }
}`;

function prependArchivedTrackables(
    trackables: ISpliceArchivedTrackablesFragment[],
    status: TrackableStatus,
    apollo: DataProxy,
) {
    spliceArchivedTrackables([], trackables, [], status, apollo);
}

function spliceArchivedTrackables(
    idsToRemove: string[],
    trackablesToPrepend: ISpliceArchivedTrackablesFragment[],
    trackablesToAppend: ISpliceArchivedTrackablesFragment[],
    status: TrackableStatus,
    apollo: DataProxy,
) {
    const archivedTrackablesResponse = getArchivedTrackables(status, apollo);

    if (!archivedTrackablesResponse) {
        return;
    }

    const cursorField = (trackable: ISpliceArchivedTrackablesFragment) =>
        `${trackable.statusChangeDate}_${trackable.id}`;
    spliceConnection(
        archivedTrackablesResponse.getArchivedTrackables,
        idsToRemove,
        trackablesToPrepend,
        trackablesToAppend,
        cursorField,
        Type.TrackableEdge,
    );
    setArchivedTrackables(archivedTrackablesResponse, status, apollo);
}

function getArchivedTrackables(status: TrackableStatus, apollo: DataProxy) {
    try {
        return apollo.readQuery<IGetArchivedTrackablesResponse>({
            query: getArchivedTrackablesQuery,
            variables: { status },
        })!;
    } catch (e) {
        log.trace("getArchivedTrackables", "no data");
        return null;
    }
}

function setArchivedTrackables(
    archivedTrackablesResponse: IGetArchivedTrackablesResponse,
    status: TrackableStatus,
    apollo: DataProxy,
) {
    apollo.writeQuery({
        data: archivedTrackablesResponse,
        query: getArchivedTrackablesQuery,
        variables: { status },
    });
}

function initArchivedTrackables(apollo: DataProxy) {
    const data = {
        __typename: Type.Query,
        getArchivedTrackables: {
            __typename: Type.TrackableConnection,
            edges: [],
            pageInfo: {
                __typename: Type.PageInfo,
                endCursor: null,
                hasNextPage: false,
            },
        },
    };
    const statuses = [
        TrackableStatus.Approved,
        TrackableStatus.Rejected,
        TrackableStatus.Expired,
    ];

    for (const status of statuses) {
        apollo.writeQuery({
            data,
            query: initArchivedTrackablesQuery,
            variables: { status },
        });
    }
}

export {
    prependArchivedTrackables,
    getArchivedTrackables,
    initArchivedTrackables,
    ISpliceArchivedTrackablesFragment,
};

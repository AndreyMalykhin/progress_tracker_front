import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import Type from "models/type";
import {
    IConnection,
    sortConnection,
    spliceConnection,
} from "utils/connection";
import makeLog from "utils/make-log";

interface ISpliceActiveTrackablesFragment {
    __typename: Type;
    id: string;
    order: number;
}

interface IGetActiveTrackablesResponse {
    __typename: Type;
    getActiveTrackables: IConnection<ISpliceActiveTrackablesFragment, number>;
}

const log = makeLog("active-trackables-helpers");

const getActiveTrackablesQuery = gql`
query GetActiveTrackables($userId: ID) {
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

const initActiveTrackablesQuery = gql`
query GetActiveTrackables($userId: ID) {
    getActiveTrackables(
        userId: $userId
    ) @connection(key: "getActiveTrackables", filter: ["userId"]) {
        edges {
            cursor
        }
        pageInfo {
            endCursor
            hasNextPage
        }
    }
}`;

function prependActiveTrackables(
    trackables: ISpliceActiveTrackablesFragment[], apollo: DataProxy,
) {
    spliceActiveTrackables([], trackables, [], apollo);
}

function removeActiveTrackables(ids: string[], apollo: DataProxy) {
    spliceActiveTrackables(ids, [], [], apollo);
}

function spliceActiveTrackables(
    idsToRemove: string[],
    trackablesToPrepend: ISpliceActiveTrackablesFragment[],
    trackablesToAppend: ISpliceActiveTrackablesFragment[],
    apollo: DataProxy,
) {
    const activeTrackablesResponse = getActiveTrackables(apollo);

    if (!activeTrackablesResponse) {
        return;
    }

    const cursorField = "order";
    spliceConnection(
        activeTrackablesResponse.getActiveTrackables,
        idsToRemove,
        trackablesToPrepend,
        trackablesToAppend,
        cursorField,
        Type.TrackableEdge,
    );
    setActiveTrackables(activeTrackablesResponse, apollo);
}

function compareTrackables(
    lhs: ISpliceActiveTrackablesFragment, rhs: ISpliceActiveTrackablesFragment,
) {
    const result = rhs.order - lhs.order;

    if (result === 0) {
        return 0;
    }

    return result < 0 ? -1 : 1;
}

function sortActiveTrackables(apollo: DataProxy) {
    const activeTrackablesResponse = getActiveTrackables(apollo);

    if (!activeTrackablesResponse) {
        return;
    }

    const cursorField = "order";
    sortConnection(activeTrackablesResponse.getActiveTrackables, cursorField,
        compareTrackables);
    setActiveTrackables(activeTrackablesResponse, apollo);
}

function getActiveTrackables(apollo: DataProxy) {
    try {
        return apollo.readQuery<IGetActiveTrackablesResponse>({
            query: getActiveTrackablesQuery,
        });
    } catch (e) {
        log.trace("getActiveTrackables(); no data");
        return null;
    }
}

function setActiveTrackables(
    activeTrackablesResponse: IGetActiveTrackablesResponse, apollo: DataProxy,
) {
    apollo.writeQuery({
        data: activeTrackablesResponse,
        query: getActiveTrackablesQuery,
    });
}

function initActiveTrackables(apollo: DataProxy) {
    apollo.writeQuery({
        data: {
            __typename: Type.Query,
            getActiveTrackables: {
                __typename: Type.TrackableConnection,
                edges: [],
                pageInfo: {
                    __typename: Type.PageInfo,
                    endCursor: null,
                    hasNextPage: false,
                },
            },
        },
        query: initActiveTrackablesQuery,
    });
}

export {
    spliceActiveTrackables,
    removeActiveTrackables,
    sortActiveTrackables,
    getActiveTrackables,
    initActiveTrackables,
    prependActiveTrackables,
    ISpliceActiveTrackablesFragment,
};

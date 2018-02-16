import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import Type from "models/type";
import {
    IConnection,
    sortConnection,
    spliceConnection,
} from "utils/connection";

interface ISpliceActiveTrackablesFragment {
    __typename: Type;
    id: string;
    order: number;
}

interface IGetActiveTrackablesResponse {
    getActiveTrackables: IConnection<ISpliceActiveTrackablesFragment, number>;
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
    const cursorField = "order";
    spliceConnection(
        activeTrackablesResponse.getActiveTrackables,
        idsToRemove,
        trackablesToAdd,
        cursorField,
        Type.TrackableEdge,
        compareTrackables,
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
    const cursorField = "order";
    sortConnection(activeTrackablesResponse.getActiveTrackables, cursorField,
        compareTrackables);
    setActiveTrackables(activeTrackablesResponse, apollo);
}

function getActiveTrackables(apollo: DataProxy) {
    return apollo.readQuery<IGetActiveTrackablesResponse>({
        query: getActiveTrackablesQuery,
        variables: { userId: getSession(apollo).userId },
    })!;
}

function setActiveTrackables(
    activeTrackablesResponse: IGetActiveTrackablesResponse, apollo: DataProxy,
) {
    apollo.writeQuery({
        data: activeTrackablesResponse,
        query: getActiveTrackablesQuery,
        variables: { userId: getSession(apollo).userId },
    });
}

export {
    spliceActiveTrackables,
    sortActiveTrackables,
    getActiveTrackables,
    ISpliceActiveTrackablesFragment,
};

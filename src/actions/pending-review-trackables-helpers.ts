import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import Audience from "models/audience";
import Type from "models/type";
import { IConnection, spliceConnection } from "utils/connection";
import makeLog from "utils/make-log";

interface ISplicePendingReviewTrackablesFragment {
    __typename: Type;
    id: string;
    statusChangeDate: number;
}

interface IGetPendingReviewTrackablesResponse {
    getPendingReviewTrackables:
        IConnection<ISplicePendingReviewTrackablesFragment, string>;
}

const log = makeLog("pending-review-trackables-helpers");

const getPendingReviewTrackablesQuery = gql`
query GetPendingReviewTrackables($audience: Audience!) {
    getPendingReviewTrackables(audience: $audience) @connection(
        key: "getPendingReviewTrackables", filter: ["audience"]
    ) {
        edges {
            cursor
            node {
                id
                statusChangeDate
            }
        }
        pageInfo {
            hasNextPage
            endCursor
        }
    }
}`;

const initPendingReviewTrackablesQuery = gql`
query GetPendingReviewTrackables($audience: Audience!) {
    getPendingReviewTrackables(audience: $audience) @connection(
        key: "getPendingReviewTrackables", filter: ["audience"]
    ) {
        edges {
            cursor
        }
        pageInfo {
            hasNextPage
            endCursor
        }
    }
}`;

function appendPendingReviewTrackables(
    trackables: ISplicePendingReviewTrackablesFragment[],
    audience: Audience,
    apollo: DataProxy,
) {
    splicePendingReviewTrackables([], [], trackables, audience, apollo);
}

function splicePendingReviewTrackables(
    idsToRemove: string[],
    trackablesToPrepend: ISplicePendingReviewTrackablesFragment[],
    trackablesToAppend: ISplicePendingReviewTrackablesFragment[],
    audience: Audience,
    apollo: DataProxy,
) {
    const pendingReviewTrackablesResponse =
        getPendingReviewTrackables(audience, apollo);

    if (!pendingReviewTrackablesResponse) {
        return;
    }

    if (pendingReviewTrackablesResponse.getPendingReviewTrackables.pageInfo.hasNextPage) {
        trackablesToAppend = [];
    }

    const cursorField = (trackable: ISplicePendingReviewTrackablesFragment) =>
        `${trackable.statusChangeDate}_${trackable.id}`;
    spliceConnection(
        pendingReviewTrackablesResponse.getPendingReviewTrackables,
        idsToRemove,
        trackablesToPrepend,
        trackablesToAppend,
        cursorField,
        Type.TrackableEdge,
    );
    setPendingReviewTrackables(
        pendingReviewTrackablesResponse, audience, apollo);
}

function getPendingReviewTrackables(audience: Audience, apollo: DataProxy) {
    try {
        return apollo.readQuery<IGetPendingReviewTrackablesResponse>({
            query: getPendingReviewTrackablesQuery,
            variables: { audience },
        })!;
    } catch (e) {
        log.trace("getPendingReviewTrackables", "no data");
        return null;
    }
}

function setPendingReviewTrackables(
    pendingReviewTrackablesResponse: IGetPendingReviewTrackablesResponse,
    audience: Audience,
    apollo: DataProxy,
) {
    apollo.writeQuery({
        data: pendingReviewTrackablesResponse,
        query: getPendingReviewTrackablesQuery,
        variables: { audience },
    });
}

function initPendingReviewTrackables(apollo: DataProxy) {
    const data = {
        __typename: Type.Query,
        getPendingReviewTrackables: {
            __typename: Type.TrackableConnection,
            edges: [],
            pageInfo: {
                __typename: Type.PageInfo,
                endCursor: null,
                hasNextPage: false,
            },
        },
    };
    apollo.writeQuery({
        data,
        query: initPendingReviewTrackablesQuery,
        variables: { audience: Audience.Me },
    });
}

export {
    appendPendingReviewTrackables,
    initPendingReviewTrackables,
};

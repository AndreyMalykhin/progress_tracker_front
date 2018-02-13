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
    getPendingReviewTrackablesByAudience:
        IConnection<ISplicePendingReviewTrackablesFragment, number>;
}

const log = makeLog("pending-review-trackables-helpers");

const getPendingReviewTrackablesQuery = gql`
query GetPendingReviewTrackables($audience: Audience!) {
    getPendingReviewTrackablesByAudience(audience: $audience) @connection(
        key: "getPendingReviewTrackablesByAudience", filter: ["audience"]
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

function splicePendingReviewTrackables(
    idsToRemove: string[],
    trackablesToAdd: ISplicePendingReviewTrackablesFragment[],
    audience: Audience,
    apollo: DataProxy,
) {
    const pendingReviewTrackablesResponse =
        getPendingReviewTrackables(audience, apollo);

    if (!pendingReviewTrackablesResponse) {
        return;
    }

    const cursorField = "statusChangeDate";
    spliceConnection(
        pendingReviewTrackablesResponse.getPendingReviewTrackablesByAudience,
        idsToRemove,
        trackablesToAdd,
        cursorField,
        Type.TrackableEdge,
        compareTrackables,
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
        log("getPendingReviewTrackables(); error=%o", e);
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

function compareTrackables(
    lhs: ISplicePendingReviewTrackablesFragment,
    rhs: ISplicePendingReviewTrackablesFragment,
) {
    const result = rhs.statusChangeDate - lhs.statusChangeDate;

    if (result === 0) {
        return 0;
    }

    return result < 0 ? -1 : 1;
}

export { splicePendingReviewTrackables };

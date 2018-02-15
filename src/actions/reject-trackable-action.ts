import {
    getOptimisticResponse,
    IReviewTrackableResponseFragment,
    reviewTrackableResponseFragment,
    updateActivities,
} from "actions/review-trackable-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import RejectReason from "models/reject-reason";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";

interface IRejectTrackableResponse {
    rejectTrackable: IReviewTrackableResponseFragment;
}

const rejectTrackableQuery = gql`
${reviewTrackableResponseFragment}

mutation RejectTrackable($id: ID!, $reason: RejectReason!) {
    rejectTrackable(id: $id, reason: $reason) {
        ...ReviewTrackableResponseFragment
    }
}`;

async function rejectTrackable(
    id: string,
    reason: RejectReason,
    mutate: MutationFunc<IRejectTrackableResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const mutationName = "rejectTrackable";
    const counterField = "rejectCount";
    const result = await mutate({
        optimisticResponse: getOptimisticResponse(
            id, counterField, mutationName, apollo),
        update: (proxy, response) => {
            const responseData =
                (response.data as IRejectTrackableResponse).rejectTrackable;
            const isApprove = false;
            updateActivities(isApprove, responseData, proxy);
        },
        variables: { id, reason },
    });
    return result.data;
}

export { rejectTrackable, IRejectTrackableResponse, rejectTrackableQuery };

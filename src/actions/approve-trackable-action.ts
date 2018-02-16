import { addActivity } from "actions/activity-helpers";
import {
    getOptimisticResponse,
    IReviewTrackableResponseFragment,
    reviewTrackableResponseFragment,
    updateActivities,
} from "actions/review-trackable-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Difficulty from "models/difficulty";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";

interface IApproveTrackableResponse {
    approveTrackable: IReviewTrackableResponseFragment;
}

const approveTrackableQuery = gql`
${reviewTrackableResponseFragment}

mutation ApproveTrackable($id: ID!, $difficulty: Difficulty!) {
    approveTrackable(id: $id, difficulty: $difficulty) {
        ...ReviewTrackableResponseFragment
    }
}`;

async function approveTrackable(
    id: string,
    difficulty: Difficulty,
    mutate: MutationFunc<IApproveTrackableResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const mutationName = "approveTrackable";
    const counterField = "approveCount";
    const result = await mutate({
        optimisticResponse: getOptimisticResponse(
            id, counterField, mutationName, apollo),
        update: (proxy, response) => {
            const responseData =
                (response.data as IApproveTrackableResponse).approveTrackable;
            const isApprove = true;
            updateActivities(isApprove, responseData, proxy);
        },
        variables: { id, difficulty },
    });
    return result.data;
}

export { approveTrackable, IApproveTrackableResponse, approveTrackableQuery };

import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";
import Difficulty from "utils/difficulty";

interface IApproveTrackableResponse {
    approveTrackable: {
        trackable: ITrackableFragment;
    };
}

interface ITrackableFragment {
    id: string;
    approveCount: number;
    isReviewed: boolean;
}

const trackableFragment = gql`
fragment ApproveTrackableFragment on ITrackable {
    id
    ... on IGoal {
        isReviewed
        approveCount
    }
}`;

const approveTrackableQuery = gql`
${trackableFragment}

mutation ApproveTrackable($id: ID!, $difficulty: Difficulty!) {
    approveTrackable(id: $id, difficulty: $difficulty) {
        trackable {
            ...ApproveTrackableFragment
        }
    }
}`;

async function approveTrackable(
    id: string,
    difficulty: Difficulty,
    mutate: MutationFunc<IApproveTrackableResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(id, apollo),
        variables: { id, difficulty },
    });
}

function getOptimisticResponse(
    trackableId: string, apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId = dataIdFromObject(
        { id: trackableId, __typename: Type.TaskGoal })!;
    const trackable = apollo.readFragment<ITrackableFragment>(
        { id: fragmentId, fragment: trackableFragment })!;
    ++trackable.approveCount;
    trackable.isReviewed = true;
    return {
        __typename: Type.Mutation,
        approveTrackable: {
            __typename: Type.ApproveTrackableResponse,
            trackable,
        },
    } as IApproveTrackableResponse;
}

export { approveTrackable, IApproveTrackableResponse, approveTrackableQuery };

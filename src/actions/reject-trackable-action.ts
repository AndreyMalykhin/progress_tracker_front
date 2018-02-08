import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import RejectReason from "models/reject-reason";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";

interface IRejectTrackableResponse {
    rejectTrackable: {
        trackable: ITrackableFragment;
    };
}

interface ITrackableFragment {
    id: string;
    isReviewed: boolean;
    rejectCount: number;
}

const trackableFragment = gql`
fragment RejectTrackableFragment on ITrackable {
    id
    ... on IGoal {
        isReviewed
        rejectCount
    }
}`;

const rejectTrackableQuery = gql`
${trackableFragment}

mutation RejectTrackable($id: ID!, $reason: RejectReason!) {
    rejectTrackable(id: $id, reason: $reason) {
        trackable {
            ...RejectTrackableFragment
        }
    }
}`;

async function rejectTrackable(
    id: string,
    reason: RejectReason,
    mutate: MutationFunc<IRejectTrackableResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(id, apollo),
        variables: { id, reason },
    });
}

function getOptimisticResponse(
    trackableId: string, apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId = dataIdFromObject(
        { id: trackableId, __typename: Type.TaskGoal })!;
    const trackable = apollo.readFragment<ITrackableFragment>(
        { id: fragmentId, fragment: trackableFragment })!;
    ++trackable.rejectCount;
    trackable.isReviewed = true;
    return {
        __typename: Type.Mutation,
        rejectTrackable: {
            __typename: Type.RejectTrackableResponse,
            trackable,
        },
    } as IRejectTrackableResponse;
}

export { rejectTrackable, IRejectTrackableResponse, rejectTrackableQuery };

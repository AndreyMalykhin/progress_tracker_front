import { prependActivity } from "actions/activity-helpers";
import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import dataIdFromObject from "utils/data-id-from-object";
import uuid from "utils/uuid";

interface IReviewTrackableResponseFragment {
    user: IUserFragment;
    trackable: ITrackableFragment;
    bonusRating?: number;
}

interface IUserFragment {
    __typename: Type;
    id: string;
    rewardableReviewsLeft: number;
}

interface ITrackableFragment {
    id: string;
    isReviewed: boolean;
    rejectCount: number;
    approveCount: number;
}

const trackableFragment = gql`
fragment ReviewTrackableFragment on ITrackable {
    id
    ... on IGoal {
        isReviewed
        rejectCount
        approveCount
    }
}`;

const userFragment = gql`
fragment ReviewTrackableUserFragment on User {
    id
    rewardableReviewsLeft
}`;

const reviewTrackableResponseFragment = gql`
${trackableFragment}
${userFragment}

fragment ReviewTrackableResponseFragment on ReviewTrackableResponse {
    trackable {
        ...ReviewTrackableFragment
    }
    user {
        ...ReviewTrackableUserFragment
    }
    bonusRating
}`;

const activityFragment = gql`
fragment ReviewTrackableActivityFragment on ExternalGoalReviewedActivity {
    id
    date
    isApprove
    ratingDelta
    trackable {
        id
    }
    user {
        id
    }
}`;

function getOptimisticResponse(
    trackableId: string,
    counterField: keyof ITrackableFragment,
    mutationName: string,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const trackableFragmentId = dataIdFromObject(
        { id: trackableId, __typename: Type.TaskGoal })!;
    const trackable = apollo.readFragment<ITrackableFragment>(
        { id: trackableFragmentId, fragment: trackableFragment })!;
    trackable.isReviewed = true;
    ++(trackable[counterField] as number);
    const userFragmentdId = dataIdFromObject(
        { __typename: Type.User, id: getSession(apollo).userId })!;
    const user = apollo.readFragment<IUserFragment>(
        { id: userFragmentdId, fragment: userFragment })!;
    let bonusRating = 0;

    if (user.rewardableReviewsLeft > 0) {
        --user.rewardableReviewsLeft;
        bonusRating = 1;
    }

    return {
        __typename: Type.Mutation,
        [mutationName]: {
            __typename: Type.ReviewTrackableResponse,
            bonusRating,
            trackable,
            user,
        } as IReviewTrackableResponseFragment,
    };
}

function updateActivities(
    isApprove: boolean,
    response: IReviewTrackableResponseFragment,
    apollo: DataProxy,
) {
    const { trackable, bonusRating, user } = response;
    const activity = {
        __typename: Type.ExternalGoalReviewedActivity,
        date: Date.now(),
        id: uuid(),
        isApprove,
        ratingDelta: bonusRating,
        trackable,
        user,
    };
    prependActivity(activity, activityFragment, apollo);
}

export {
    getOptimisticResponse,
    updateActivities,
    reviewTrackableResponseFragment,
    IReviewTrackableResponseFragment,
};

import { addActivity, addGoalAchievedActivity } from "actions/activity-helpers";
import {
    IUpdateProgressFragment,
    updateProgress,
    updateProgressFragment,
} from "actions/aggregate-helpers";
import { addProgress } from "actions/goal-helpers";
import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";
import uuid from "utils/uuid";

interface IAddNumericalGoalProgressResponse {
    addNumericalGoalProgress: {
        trackable: {
            __typename: Type;
            id: string;
            progress: number;
            status: TrackableStatus;
            statusChangeDate?: number;
            parent?: {
                id: string;
                progress: number;
            };
        };
    };
}

interface IGoalFragment {
    __typename: Type;
    id: string;
    progress: number;
    maxProgress: number;
    status: TrackableStatus;
    statusChangeDate?: number;
    parent?: IUpdateProgressFragment;
}

const goalFragment = gql`
${updateProgressFragment}

fragment AddNumericalGoalProgressFragment on NumericalGoal {
    id
    progress
    maxProgress
    status
    statusChangeDate
    parent {
        ...UpdateProgressAggregateFragment
    }
}`;

const addNumericalGoalProgressQuery = gql`
mutation AddNumericalGoalProgress($id: ID!, $value: Float!) {
    addNumericalGoalProgress(id: $id, value: $value) {
        trackable {
            ... on NumericalGoal {
                id
                progress
                status
                statusChangeDate
                parent {
                    id
                    progress
                }
            }
        }
    }
}`;

const progressChangedActivityFragment = gql`
fragment AddNumericalGoalActivityFragment on NumericalGoalProgressChangedActivity {
    id
    date
    delta
    user {
        id
    }
    trackable {
        id
    }
}`;

async function addNumericalGoalProgress(
    id: string,
    value: number,
    mutate: MutationFunc<IAddNumericalGoalProgressResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId =
        dataIdFromObject({ __typename: Type.NumericalGoal, id })!;
    const goal = apollo.readFragment<IGoalFragment>({
        fragment: goalFragment,
        fragmentName: "AddNumericalGoalProgressFragment",
        id: fragmentId,
    })!;
    const prevProgress = goal.progress;
    const result = await mutate({
        optimisticResponse: getOptimisticResponse(goal, value, apollo),
        update: (proxy, response) => {
            updateActivities(
                prevProgress,
                response.data as IAddNumericalGoalProgressResponse,
                proxy,
            );
        },
        variables: { id, value },
    });
    return result.data;
}

function updateActivities(
    prevProgress: number,
    response: IAddNumericalGoalProgressResponse,
    apollo: DataProxy,
) {
    const { trackable } = response.addNumericalGoalProgress;
    const user = {
        __typename: Type.User,
        id: getSession(apollo).userId,
    };
    const progressChangedActivity = {
        __typename: Type.NumericalGoalProgressChangedActivity,
        date: Date.now(),
        delta: trackable.progress - prevProgress,
        id: uuid(),
        trackable,
        user,
    };
    addActivity(
        progressChangedActivity, progressChangedActivityFragment, apollo);

    if (trackable.status === TrackableStatus.Active) {
        return;
    }

    const goalAchievedActivity = {
        __typename: Type.GoalAchievedActivity,
        date: Date.now(),
        id: uuid(),
        trackable,
        user,
    };
    addGoalAchievedActivity(goalAchievedActivity, apollo);
}

function getOptimisticResponse(
    goal: IGoalFragment,
    value: number,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    addProgress(goal, value);
    return {
        __typename: Type.Mutation,
        addNumericalGoalProgress: {
            __typename: Type.AddNumericalGoalProgressResponse, trackable: goal,
        },
    } as IAddNumericalGoalProgressResponse;
}

export {
    addNumericalGoalProgress,
    addNumericalGoalProgressQuery,
    IAddNumericalGoalProgressResponse,
};

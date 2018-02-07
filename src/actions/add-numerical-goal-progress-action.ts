import {
    IUpdateProgressFragment,
    updateProgress,
    updateProgressFragment,
} from "actions/aggregate-helpers";
import { addProgress } from "actions/goal-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";

interface IAddNumericalGoalProgressResponse {
    addNumericalGoalProgress: {
        trackable: {
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

async function addNumericalGoalProgress(
    id: string,
    value: number,
    mutate: MutationFunc<IAddNumericalGoalProgressResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const result = await mutate({
        optimisticResponse: getOptimisticResponse(id, value, apollo),
        variables: { id, value },
    });
    return result.data;
}

function getOptimisticResponse(
    id: string,
    value: number,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId =
        dataIdFromObject({ __typename: Type.NumericalGoal, id })!;
    const goal = apollo.readFragment<IGoalFragment>({
        fragment: goalFragment,
        fragmentName: "AddNumericalGoalProgressFragment",
        id: fragmentId,
    })!;
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

import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import gql from "graphql-tag";
import Difficulty from "models/difficulty";
import ProgressDisplayMode from "models/progress-display-mode";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";

interface IEditNumericalGoalResponse {
    editNumericalGoal: {
        trackable: {
            id: string;
            title: string;
            deadlineDate?: number;
            difficulty: Difficulty;
            iconName: string;
            progressDisplayMode: ProgressDisplayMode;
        };
    };
}

interface IEditNumericalGoalFragment {
    id: string;
    title?: string;
    deadlineDate?: number|null;
    difficulty?: Difficulty;
    iconName?: string;
    progressDisplayMode?: ProgressDisplayMode;
}

const goalFragment = gql`
fragment EditNumericalGoalFragment on NumericalGoal {
    id
    title
    deadlineDate
    difficulty
    iconName
    progressDisplayMode
}`;

const editNumericalGoalQuery = gql`
${goalFragment}

mutation EditNumericalGoal($goal: EditNumericalGoalInput!) {
    editNumericalGoal(goal: $goal) {
        trackable {
            ...EditNumericalGoalFragment
        }
    }
}
`;

async function editNumericalGoal(
    goal: IEditNumericalGoalFragment,
    mutate: MutationFunc<IEditNumericalGoalResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    return await mutate({
        optimisticResponse: getOptimisticResponse(goal, apollo),
        variables: { goal },
    });
}

function getOptimisticResponse(
    goal: IEditNumericalGoalFragment,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId =
        dataIdFromObject({ __typename: Type.NumericalGoal, id: goal.id })!;
    const storedGoal = apollo.readFragment<IEditNumericalGoalFragment>(
        { id: fragmentId, fragment: goalFragment })!;
    Object.assign(storedGoal, goal);
    return {
        __typename: Type.Mutation,
        editNumericalGoal: {
            __typename: Type.EditNumericalGoalResponse,
            trackable: storedGoal,
        },
    } as IEditNumericalGoalResponse;
}

export {
    editNumericalGoal,
    editNumericalGoalQuery,
    IEditNumericalGoalResponse,
    IEditNumericalGoalFragment,
};

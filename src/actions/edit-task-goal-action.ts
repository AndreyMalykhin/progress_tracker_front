import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import gql from "graphql-tag";
import ProgressDisplayMode from "models/progress-display-mode";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";
import Difficulty from "utils/difficulty";

interface IEditTaskGoalResponse {
    editTaskGoal: {
        trackable: {
            id: string;
            title: string;
            deadlineDate?: number;
            difficulty: Difficulty;
            iconName: string;
            isPublic: boolean;
            progressDisplayMode: ProgressDisplayMode;
        };
    };
}

interface IEditTaskGoalFragment {
    id: string;
    title?: string;
    deadlineDate?: number|null;
    difficulty?: Difficulty;
    iconName?: string;
    isPublic?: boolean;
    progressDisplayMode?: ProgressDisplayMode;
}

const editTaskGoalQuery = gql`
mutation EditTaskGoal($goal: EditTaskGoalInput!) {
    editTaskGoal(goal: $goal) {
        trackable {
            id
            title
            deadlineDate
            difficulty
            iconName
            isPublic
            progressDisplayMode
        }
    }
}
`;

const goalFragment = gql`
fragment EditTaskGoalFragment on TaskGoal {
    id
    title
    deadlineDate
    difficulty
    iconName
    isPublic
    progressDisplayMode
}`;

async function editTaskGoal(
    goal: IEditTaskGoalFragment,
    mutate: MutationFunc<IEditTaskGoalResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(goal, apollo),
        variables: { goal },
    });
}

function getOptimisticResponse(
    goal: IEditTaskGoalFragment, apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId =
        dataIdFromObject({ __typename: Type.TaskGoal, id: goal.id })!;
    const storedGoal = apollo.readFragment<IEditTaskGoalFragment>(
        { id: fragmentId, fragment: goalFragment })!;
    Object.assign(storedGoal, goal);
    return {
        __typename: Type.Mutation,
        editTaskGoal: {
            __typename: Type.EditTaskGoalResponse,
            trackable: storedGoal,
        },
    } as IEditTaskGoalResponse;
}

export {
    editTaskGoal,
    editTaskGoalQuery,
    IEditTaskGoalResponse,
    IEditTaskGoalFragment,
};

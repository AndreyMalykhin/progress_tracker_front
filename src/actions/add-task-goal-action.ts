import { spliceActiveTrackables } from "actions/active-trackables-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import gql from "graphql-tag";
import ProgressDisplayMode from "models/progress-display-mode";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import Difficulty from "utils/difficulty";
import uuid from "utils/uuid";

interface IAddTaskGoalResponse {
    addTaskGoal: {
        trackable: {
            __typename: Type;
            deadlineDate?: number;
            difficulty: Difficulty;
            iconName: string;
            id: string;
            isPublic: boolean;
            maxProgress: number;
            order: number;
            parent: null;
            progress: number;
            progressDisplayMode: ProgressDisplayMode;
            proofPhotoUrlSmall: null;
            status: TrackableStatus;
            statusChangeDate: null;
            tasks: Array<{
                id: string;
                title: string;
                isDone: boolean;
                goal: {
                    id: string;
                };
            }>
            title: string;
        };
    };
}

interface IAddTaskGoalFragment {
    title: string;
    deadlineDate?: number;
    difficulty: Difficulty;
    iconName: string;
    isPublic: boolean;
    progressDisplayMode: ProgressDisplayMode;
    tasks: Array<{
        title: string;
    }>;
}

const addTaskGoalQuery = gql`
mutation AddTaskGoal($goal: AddTaskGoalInput!) {
    addTaskGoal(goal: $goal) {
        trackable {
            deadlineDate
            difficulty
            iconName
            id
            isPublic
            maxProgress
            order
            parent {
                id
            }
            progress
            progressDisplayMode
            proofPhotoUrlSmall
            status
            statusChangeDate
            tasks {
                id
                title
                isDone
                goal {
                    id
                }
            }
            title
        }
    }
}`;

async function addTaskGoal(
    goal: IAddTaskGoalFragment,
    mutate: MutationFunc<IAddTaskGoalResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(goal),
        update: (proxy, response) => {
            updateActiveTrackables(response.data, proxy);
        },
        variables: { goal },
    });
}

function updateActiveTrackables(
    response: IAddTaskGoalResponse, apollo: DataProxy,
) {
    const idsToRemove: string[] = [];
    const trackablesToAdd = [response.addTaskGoal.trackable];
    spliceActiveTrackables(idsToRemove, trackablesToAdd, apollo);
}

function getOptimisticResponse(goal: IAddTaskGoalFragment) {
    const goalId = uuid();
    const tasks = goal.tasks.map((task) => {
        return {
            __typename: Type.Task,
            goal: {
                __typename: Type.TaskGoal,
                id: goalId,
            },
            id: uuid(),
            isDone: false,
            title: task.title,
        };
    });
    return {
        __typename: Type.Mutation,
        addTaskGoal: {
            __typename: Type.AddTaskGoalResponse,
            trackable: {
                __typename: Type.TaskGoal,
                deadlineDate: goal.deadlineDate || null,
                difficulty: goal.difficulty,
                iconName: goal.iconName,
                id: goalId,
                isPublic: goal.isPublic,
                maxProgress: goal.tasks.length,
                order: Date.now(),
                parent: null,
                progress: 0,
                progressDisplayMode: goal.progressDisplayMode,
                proofPhotoUrlSmall: null,
                status: TrackableStatus.Active,
                statusChangeDate: null,
                tasks,
                title: goal.title,
            },
        },
    } as IAddTaskGoalResponse;
}

export {
    addTaskGoal,
    addTaskGoalQuery,
    IAddTaskGoalResponse,
    IAddTaskGoalFragment,
};

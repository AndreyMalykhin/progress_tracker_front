import { spliceActiveTrackables } from "actions/active-trackables-helpers";
import { addTrackableAddedActivity } from "actions/activity-helpers";
import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import gql from "graphql-tag";
import Difficulty from "models/difficulty";
import ProgressDisplayMode from "models/progress-display-mode";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
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
            proofPhotoUrlMedium: null;
            status: TrackableStatus;
            statusChangeDate: null;
            creationDate: number;
            tasks: Array<{
                id: string;
                title: string;
                isDone: boolean;
                goal: {
                    id: string;
                };
            }>
            title: string;
            user: {
                __typename: Type;
                id: string;
            }
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
            proofPhotoUrlMedium
            status
            statusChangeDate
            creationDate
            tasks {
                id
                title
                isDone
                goal {
                    id
                }
            }
            title
            user {
                id
            }
        }
    }
}`;

async function addTaskGoal(
    goal: IAddTaskGoalFragment,
    mutate: MutationFunc<IAddTaskGoalResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(goal, apollo),
        update: (proxy, response) => {
            const responseData = response.data as IAddTaskGoalResponse;
            updateActiveTrackables(responseData, proxy);
            updateActivities(responseData, proxy);
        },
        variables: { goal },
    });
}

function updateActivities(response: IAddTaskGoalResponse, apollo: DataProxy) {
    const { trackable } = response.addTaskGoal;
    const activity = {
        __typename: Type.TrackableAddedActivity,
        date: Date.now(),
        id: uuid(),
        trackable,
        user: trackable.user,
    };
    addTrackableAddedActivity(activity, apollo);
}

function updateActiveTrackables(
    response: IAddTaskGoalResponse, apollo: DataProxy,
) {
    const idsToRemove: string[] = [];
    const trackablesToAdd = [response.addTaskGoal.trackable];
    spliceActiveTrackables(idsToRemove, trackablesToAdd, apollo);
}

function getOptimisticResponse(
    goal: IAddTaskGoalFragment, apollo: ApolloClient<NormalizedCacheObject>) {
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
    const currentDate = Date.now();
    return {
        __typename: Type.Mutation,
        addTaskGoal: {
            __typename: Type.AddTaskGoalResponse,
            trackable: {
                __typename: Type.TaskGoal,
                creationDate: currentDate,
                deadlineDate: goal.deadlineDate || null,
                difficulty: goal.difficulty,
                iconName: goal.iconName,
                id: goalId,
                isPublic: goal.isPublic,
                isReviewed: null,
                maxProgress: goal.tasks.length,
                order: currentDate,
                parent: null,
                progress: 0,
                progressDisplayMode: goal.progressDisplayMode,
                proofPhotoUrlMedium: null,
                status: TrackableStatus.Active,
                statusChangeDate: null,
                tasks,
                title: goal.title,
                user: {
                    __typename: Type.User,
                    id: getSession(apollo).userId,
                },
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

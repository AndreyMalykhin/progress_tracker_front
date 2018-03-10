import { prependActivity, prependGoalAchievedActivity } from "actions/activity-helpers";
import {
    IUpdateProgressAggregateFragment,
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

interface ISetTaskDoneResponse {
    setTaskDone: {
        task: {
            __typename: Type;
            id: string;
            isDone: boolean;
            goal: {
                __typename: Type;
                id: string;
                progress: number;
                status: TrackableStatus;
                achievementDate?: number;
                statusChangeDate?: number;
                parent?: {
                    id: string;
                    progress: number;
                }
            }
        };
    };
}

interface IGoalFragment {
    __typename: Type;
    id: string;
    tasks: Array<{
        id: string;
        isDone: boolean;
    }>;
}

interface ITaskFragment {
    __typename: Type;
    id: string;
    isDone: boolean;
    goal: {
        __typename: Type;
        id: string;
        progress: number;
        maxProgress: number;
        status: TrackableStatus;
        achievementDate: number;
        statusChangeDate: number;
        parent?: IUpdateProgressAggregateFragment;
    };
}

const taskFragment = gql`
${updateProgressFragment}

fragment SetTaskDoneTaskFragment on Task {
    id
    isDone
    goal {
        id
        progress
        maxProgress
        status
        achievementDate
        statusChangeDate
        parent {
            ...UpdateProgressAggregateFragment
        }
    }
}`;

const setTaskDoneQuery = gql`
mutation SetTaskDone($id: ID!, $isDone: Boolean!) {
    setTaskDone(id: $id, isDone: $isDone) {
        task {
            id
            isDone
            goal {
                id
                progress
                status
                achievementDate
                statusChangeDate
                parent {
                    id
                    progress
                }
            }
        }
    }
}`;

const goalFragment = gql`
fragment SetTaskDoneGoalFragment on TaskGoal {
    id
    tasks {
        id
        isDone
    }
}`;

const progressChangedActivityFragment = gql`
fragment SetTaskDoneActivityFragment on TaskGoalProgressChangedActivity {
    id
    date
    user {
        id
    }
    trackable {
        id
    }
    task {
        id
    }
}`;

async function setTaskDone(
    id: string,
    isDone: boolean,
    mutate: MutationFunc<ISetTaskDoneResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const result = await mutate({
        optimisticResponse: getOptimisticResponse(id, isDone, apollo),
        update: (proxy, response) => {
            const responseData = response.data as ISetTaskDoneResponse;
            updateTasks(responseData, proxy);
            updateActivities(responseData, proxy);
        },
        variables: { id, isDone },
    });
    return result.data;
}

function updateActivities(
    response: ISetTaskDoneResponse, apollo: DataProxy,
) {
    const { task } = response.setTaskDone;

    if (!task.isDone) {
        return;
    }

    const user = {
        __typename: Type.User,
        id: getSession(apollo).userId!,
    };
    const trackable = task.goal;
    const progressChangedActivity = {
        __typename: Type.TaskGoalProgressChangedActivity,
        date: Date.now(),
        id: uuid(),
        task,
        trackable,
        user,
    };
    prependActivity(
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
    prependGoalAchievedActivity(goalAchievedActivity, apollo);
}

function updateTasks(response: ISetTaskDoneResponse, apollo: DataProxy) {
    const fragmentId = dataIdFromObject(response.setTaskDone.task.goal)!;
    const goal = apollo.readFragment<IGoalFragment>(
        {id: fragmentId, fragment: goalFragment })!;
    goal.tasks.sort((lhs, rhs) => {
        if (lhs.isDone === rhs.isDone) {
            return 0;
        }

        return lhs.isDone ? 1 : -1;
    });
    apollo.writeFragment(
        { data: goal, fragment: goalFragment, id: fragmentId });
}

function getOptimisticResponse(
    id: string,
    isDone: boolean,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId = dataIdFromObject({ __typename: Type.Task, id })!;
    const task = apollo.readFragment<ITaskFragment>({
        fragment: taskFragment,
        fragmentName: "SetTaskDoneTaskFragment",
        id: fragmentId,
    })!;
    task.isDone = isDone;
    addProgress(task.goal, isDone ? 1 : -1);
    return {
        __typename: Type.Mutation,
        setTaskDone: { __typename: Type.SetTaskDoneResponse, task },
    } as ISetTaskDoneResponse;
}

export { setTaskDone, setTaskDoneQuery, ISetTaskDoneResponse };

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

interface ISetTaskDoneResponse {
    setTaskDone: {
        task: {
            id: string;
            isDone: boolean;
            goal: {
                id: string;
                progress: number;
                status: TrackableStatus;
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
    id: string;
    tasks: Array<{
        id: string;
        isDone: boolean;
    }>;
}

interface ITaskFragment {
    id: string;
    isDone: boolean;
    goal: {
        id: string;
        progress: number;
        maxProgress: number;
        status: TrackableStatus;
        statusChangeDate: number;
        parent?: IUpdateProgressFragment;
    };
}

const taskFragment = gql`
${updateProgressFragment}

fragment SetTaskDoneTaskFragment on Task {
    id
    isDone
    goal {
        ... on TaskGoal {
            id
            progress
            maxProgress
            status
            statusChangeDate
            parent {
                ...UpdateProgressAggregateFragment
            }
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
                ... on TaskGoal {
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

async function setTaskDone(
    id: string,
    isDone: boolean,
    mutate: MutationFunc<ISetTaskDoneResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(id, isDone, apollo),
        update: (proxy, response) => {
            const fragmentId = dataIdFromObject(
                (response.data as ISetTaskDoneResponse).setTaskDone.task.goal)!;
            const goal = apollo.readFragment<IGoalFragment>(
                {id: fragmentId, fragment: goalFragment })!;
            goal.tasks.sort((lhs, rhs) => {
                if (lhs.isDone === rhs.isDone) {
                    return 0;
                }

                return lhs.isDone ? 1 : -1;
            });
            proxy.writeFragment(
                { data: goal, fragment: goalFragment, id: fragmentId });
        },
        variables: { id, isDone },
    });
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

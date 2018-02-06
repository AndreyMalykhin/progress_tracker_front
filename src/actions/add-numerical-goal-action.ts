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

interface IAddNumericalGoalResponse {
    addNumericalGoal: {
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
            title: string;
        };
    };
}

interface IAddNumericalGoalFragment {
    title: string;
    deadlineDate?: number;
    difficulty: Difficulty;
    iconName: string;
    isPublic: boolean;
    progressDisplayMode: ProgressDisplayMode;
    maxProgress: number;
}

const addNumericalGoalQuery = gql`
mutation AddNumericalGoal($goal: AddNumericalGoalInput!) {
    addNumericalGoal(goal: $goal) {
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
            title
        }
    }
}`;

async function addNumericalGoal(
    goal: IAddNumericalGoalFragment,
    mutate: MutationFunc<IAddNumericalGoalResponse>,
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
    response: IAddNumericalGoalResponse, apollo: DataProxy,
) {
    const idsToRemove: string[] = [];
    const trackablesToAdd = [response.addNumericalGoal.trackable];
    spliceActiveTrackables(idsToRemove, trackablesToAdd, apollo);
}

function getOptimisticResponse(goal: IAddNumericalGoalFragment) {
    const currentDate = Date.now();
    return {
        __typename: Type.Mutation,
        addNumericalGoal: {
            __typename: Type.AddNumericalGoalResponse,
            trackable: {
                __typename: Type.NumericalGoal,
                creationDate: currentDate,
                deadlineDate: goal.deadlineDate || null,
                difficulty: goal.difficulty,
                iconName: goal.iconName,
                id: uuid(),
                isPublic: goal.isPublic,
                maxProgress: goal.maxProgress,
                order: currentDate,
                parent: null,
                progress: 0,
                progressDisplayMode: goal.progressDisplayMode,
                proofPhotoUrlMedium: null,
                status: TrackableStatus.Active,
                statusChangeDate: null,
                title: goal.title,
            },
        },
    } as IAddNumericalGoalResponse;
}

export {
    addNumericalGoal,
    addNumericalGoalQuery,
    IAddNumericalGoalResponse,
    IAddNumericalGoalFragment,
};

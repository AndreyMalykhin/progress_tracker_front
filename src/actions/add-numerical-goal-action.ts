import { prependActiveTrackables } from "actions/active-trackables-helpers";
import { prependTrackableAddedActivity } from "actions/activity-helpers";
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
            user: {
                __typename: Type;
                id: string;
            }
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
            user {
                id
            }
        }
    }
}`;

async function addNumericalGoal(
    goal: IAddNumericalGoalFragment,
    mutate: MutationFunc<IAddNumericalGoalResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    return await mutate({
        optimisticResponse: getOptimisticResponse(goal, apollo),
        update: (proxy, response) => {
            const responseData = response.data as IAddNumericalGoalResponse;
            updateActiveTrackables(responseData, proxy);
            updateActivities(responseData, proxy);
        },
        variables: { goal },
    });
}

function updateActivities(
    response: IAddNumericalGoalResponse, apollo: DataProxy,
) {
    const { trackable } = response.addNumericalGoal;
    const activity = {
        __typename: Type.TrackableAddedActivity,
        date: Date.now(),
        id: uuid(),
        trackable,
        user: trackable.user,
    };
    prependTrackableAddedActivity(activity, apollo);
}

function updateActiveTrackables(
    response: IAddNumericalGoalResponse, apollo: DataProxy,
) {
    prependActiveTrackables([response.addNumericalGoal.trackable], apollo);
}

function getOptimisticResponse(
    goal: IAddNumericalGoalFragment,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
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
                isReviewed: null,
                maxProgress: goal.maxProgress,
                order: currentDate,
                parent: null,
                progress: 0,
                progressDisplayMode: goal.progressDisplayMode,
                proofPhotoUrlMedium: null,
                status: TrackableStatus.Active,
                statusChangeDate: null,
                title: goal.title,
                user: {
                    __typename: Type.User,
                    id: getSession(apollo).userId,
                },
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

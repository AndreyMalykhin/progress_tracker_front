import { prependActiveTrackables } from "actions/active-trackables-helpers";
import { prependTrackableAddedActivity } from "actions/activity-helpers";
import { initGymExerciseEntries } from "actions/gym-exercise-entry-helpers";
import { getSession, isAnonymous } from "actions/session-helpers";
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

interface IAddGymExerciseResponse {
    addGymExercise: {
        trackable: {
            __typename: Type;
            iconName: string;
            id: string;
            isPublic: boolean;
            order: number;
            status: TrackableStatus;
            statusChangeDate: null;
            creationDate: number;
            title: string;
            user: {
                __typename: Type;
                id: string;
            };
            recentEntries: Array<{
                id: string;
                gymExercise: {
                    id: string;
                };
                date: number;
                setCount: number;
                repetitionCount: number;
                weight: number;
            }>;
        };
    };
}

interface IAddGymExerciseFragment {
    title: string;
    iconName: string;
    isPublic: boolean;
}

const addGymExerciseQuery = gql`
mutation AddGymExercise($gymExercise: AddGymExerciseInput!) {
    addGymExercise(gymExercise: $gymExercise) {
        trackable {
            iconName
            id
            isPublic
            order
            status
            statusChangeDate
            creationDate
            title
            user {
                id
            }
            recentEntries {
                id
                gymExercise {
                    id
                }
                date
                setCount
                repetitionCount
                weight
            }
        }
    }
}`;

async function addGymExercise(
    gymExercise: IAddGymExerciseFragment,
    mutate: MutationFunc<IAddGymExerciseResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    return await mutate({
        optimisticResponse: getOptimisticResponse(gymExercise, apollo),
        update: (proxy, response) => {
            const responseData = response.data as IAddGymExerciseResponse;
            updateActiveTrackables(responseData, proxy);
            updateActivities(responseData, proxy);
            updateEntries(responseData, proxy);
        },
        variables: { gymExercise },
    });
}

function updateEntries(
    response: IAddGymExerciseResponse, apollo: DataProxy,
) {
    if (isAnonymous(getSession(apollo))) {
        initGymExerciseEntries(response.addGymExercise.trackable.id, apollo);
    }
}

function updateActivities(
    response: IAddGymExerciseResponse, apollo: DataProxy,
) {
    const { trackable } = response.addGymExercise;
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
    response: IAddGymExerciseResponse, apollo: DataProxy,
) {
    prependActiveTrackables([response.addGymExercise.trackable], apollo);
}

function getOptimisticResponse(
    gymExercise: IAddGymExerciseFragment,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const currentDate = Date.now();
    return {
        __typename: Type.Mutation,
        addGymExercise: {
            __typename: Type.AddGymExerciseResponse,
            trackable: {
                __typename: Type.GymExercise,
                creationDate: currentDate,
                iconName: gymExercise.iconName,
                id: uuid(),
                isPublic: gymExercise.isPublic,
                order: currentDate,
                recentEntries: [],
                status: TrackableStatus.Active,
                statusChangeDate: null,
                title: gymExercise.title,
                user: {
                    __typename: Type.User,
                    id: getSession(apollo).userId,
                },
            },
        },
    } as IAddGymExerciseResponse;
}

export {
    addGymExercise,
    addGymExerciseQuery,
    IAddGymExerciseResponse,
    IAddGymExerciseFragment,
};

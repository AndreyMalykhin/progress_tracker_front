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
            title: string;
            entries: Array<{
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
            title
            entries {
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
    await mutate({
        optimisticResponse: getOptimisticResponse(gymExercise),
        update: (proxy, response) => {
            updateActiveTrackables(response.data, proxy);
        },
        variables: { gymExercise },
    });
}

function updateActiveTrackables(
    response: IAddGymExerciseResponse, apollo: DataProxy,
) {
    const idsToRemove: string[] = [];
    const trackablesToAdd = [response.addGymExercise.trackable];
    spliceActiveTrackables(idsToRemove, trackablesToAdd, apollo);
}

function getOptimisticResponse(gymExercise: IAddGymExerciseFragment) {
    return {
        __typename: Type.Mutation,
        addGymExercise: {
            __typename: Type.AddGymExerciseResponse,
            trackable: {
                __typename: Type.GymExercise,
                entries: [],
                iconName: gymExercise.iconName,
                id: uuid(),
                isPublic: gymExercise.isPublic,
                order: Date.now(),
                status: TrackableStatus.Active,
                statusChangeDate: null,
                title: gymExercise.title,
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

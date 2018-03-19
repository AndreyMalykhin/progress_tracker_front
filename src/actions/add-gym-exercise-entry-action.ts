import { prependActivity } from "actions/activity-helpers";
import { prependGymExerciseEntries } from "actions/gym-exercise-entry-helpers";
import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import { recentDayCount } from "models/gym-exercise";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";
import uuid from "utils/uuid";

interface IGymExerciseFragment {
    id: string;
    recentEntries: Array<{
        id: string;
        date: number;
    }>;
}

interface IAddGymExerciseEntryResponse {
    addGymExerciseEntry: {
        entry: {
            __typename: Type;
            id: string;
            date: number;
            repetitionCount: number;
            setCount: number;
            weight: number;
            gymExercise: {
                __typename: Type;
                id: string;
            };
        };
    };
}

const addGymExerciseEntryQuery = gql`
mutation AddGymExerciseEntry(
    $id: ID!,
    $setCount: Int!,
    $repetitionCount: Int!,
    $weight: Float!
) {
    addGymExerciseEntry(
        id: $id,
        setCount: $setCount,
        repetitionCount: $repetitionCount,
        weight: $weight
    ) {
        entry {
            id
            gymExercise {
                id
            }
            date
            repetitionCount
            setCount
            weight
        }
    }
}`;

const gymExerciseFragment = gql`
fragment GymExerciseFragment on GymExercise {
    id
    recentEntries {
        id
        date
    }
}`;

const activityFragment = gql`
fragment AddGymExerciseEntryActivityFragment on GymExerciseEntryAddedActivity {
    id
    date
    entry {
        id
        setCount
        repetitionCount
        weight
    }
    trackable {
        id
    }
    user {
        id
    }
}`;

const millisecondsInDay = 86400 * 1000;

async function addGymExerciseEntry(
    trackableId: string,
    setCount: number,
    repetitionCount: number,
    weight: number,
    mutate: MutationFunc<IAddGymExerciseEntryResponse>,
) {
    const optimisticResponse = getOptimisticResponse(
        trackableId, setCount, repetitionCount, weight);
    const result = await mutate({
        optimisticResponse,
        update: (proxy, response) => {
            const responseData = response.data as IAddGymExerciseEntryResponse;
            updateRecentEntries(trackableId, responseData, proxy);
            updateAllEntries(responseData, proxy);
            updateActivities(responseData, proxy);
        },
        variables: {
            entry: {
                gymExerciseId: trackableId,
                id: optimisticResponse.addGymExerciseEntry.entry.id,
                repetitionCount,
                setCount,
                weight,
            },
        },
    });
    return result.data;
}

function updateActivities(
    response: IAddGymExerciseEntryResponse,
    apollo: DataProxy,
) {
    const { entry } = response.addGymExerciseEntry;
    const activity = {
        __typename: Type.GymExerciseEntryAddedActivity,
        date: Date.now(),
        entry,
        id: uuid(),
        trackable: entry.gymExercise,
        user: {
            __typename: Type.User,
            id: getSession(apollo).userId!,
        },
    };
    prependActivity(activity, activityFragment, apollo);
}

function updateRecentEntries(
    trackableId: string,
    response: IAddGymExerciseEntryResponse,
    apollo: DataProxy,
) {
    const fragmentId = dataIdFromObject(
        { __typename: Type.GymExercise, id: trackableId })!;
    const gymExercise = apollo.readFragment<IGymExerciseFragment>(
        { id: fragmentId, fragment: gymExerciseFragment })!;
    gymExercise.recentEntries.unshift(response.addGymExerciseEntry.entry);
    removeOldEntries(gymExercise);
    apollo.writeFragment({
        data: gymExercise,
        fragment: gymExerciseFragment,
        id: fragmentId,
    });
}

function updateAllEntries(
    response: IAddGymExerciseEntryResponse, apollo: DataProxy,
) {
    const { entry } = response.addGymExerciseEntry;
    prependGymExerciseEntries([entry], entry.gymExercise.id, apollo);
}

function removeOldEntries(gymExercise: IGymExerciseFragment) {
    const { recentEntries } = gymExercise;
    const currentDate = Date.now();

    for (let i = recentEntries.length - 1; i >= 0; --i) {
        const isOld = currentDate > recentEntries[i].date +
            millisecondsInDay * recentDayCount;

        if (isOld) {
            recentEntries.splice(i, 1);
        }
    }
}

function getOptimisticResponse(
    trackableId: string,
    setCount: number,
    repetitionCount: number,
    weight: number,
) {
    return {
        __typename: Type.Mutation,
        addGymExerciseEntry: {
            __typename: Type.AddGymExerciseEntryResponse,
            entry: {
                __typename: Type.GymExerciseEntry,
                date: Date.now(),
                gymExercise: { __typename: Type.GymExercise, id: trackableId },
                id: uuid(),
                repetitionCount,
                setCount,
                weight,
            },
        },
    } as IAddGymExerciseEntryResponse;
}

export {
    addGymExerciseEntry,
    addGymExerciseEntryQuery,
    IAddGymExerciseEntryResponse,
};

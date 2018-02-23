import { prependActivity } from "actions/activity-helpers";
import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
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
            id: string;
            date: number;
            repetitionCount: number;
            setCount: number;
            weight: number;
            gymExercise: {
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

const millisecondsInWeek = 604800 * 1000;

async function addGymExerciseEntry(
    trackableId: string,
    setCount: number,
    repetitionCount: number,
    weight: number,
    mutate: MutationFunc<IAddGymExerciseEntryResponse>,
) {
    const result = await mutate({
        optimisticResponse: getOptimisticResponse(trackableId, repetitionCount,
            setCount, weight),
        update: (proxy, response) => {
            const responseData = response.data as IAddGymExerciseEntryResponse;
            updateRecentEntries(trackableId, responseData, proxy);
            updateAllEntries(responseData, proxy);
            updateActivities(responseData, proxy);
        },
        variables: { id: trackableId, setCount, repetitionCount, weight },
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
    // TODO
}

function removeOldEntries(gymExercise: IGymExerciseFragment) {
    const { recentEntries } = gymExercise;
    const currentDate = Date.now();

    for (let i = recentEntries.length - 1; i >= 0; --i) {
        const isMoreThanWeekAgo = currentDate > recentEntries[i].date +
            millisecondsInWeek;

        if (isMoreThanWeekAgo) {
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

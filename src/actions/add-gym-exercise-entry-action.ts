import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";
import uuid from "utils/uuid";

interface IGymExerciseFragment {
    id: string;
    entries: Array<{
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
    entries {
        id
        date
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
    await mutate({
        optimisticResponse: getOptimisticResponse(trackableId, repetitionCount,
            setCount, weight),
        update: (proxy, response) => {
            updateEntries(trackableId, response.data, proxy);
        },
        variables: { id: trackableId, setCount, repetitionCount, weight },
    });
}

function updateEntries(
    trackableId: string,
    response: IAddGymExerciseEntryResponse,
    apollo: DataProxy,
) {
    const fragmentId = dataIdFromObject(
        { __typename: Type.GymExercise, id: trackableId })!;
    const gymExercise = apollo.readFragment<IGymExerciseFragment>(
        { id: fragmentId, fragment: gymExerciseFragment })!;
    gymExercise.entries.unshift(response.addGymExerciseEntry.entry);
    removeOldEntries(gymExercise);
    apollo.writeFragment({
        data: gymExercise,
        fragment: gymExerciseFragment,
        id: fragmentId,
    });
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

function removeOldEntries(gymExercise: IGymExerciseFragment) {
    const { entries } = gymExercise;
    const currentDate = Date.now();

    for (let i = entries.length - 1; i >= 0; --i) {
        const isMoreThanWeekAgo = currentDate > entries[i].date +
            millisecondsInWeek;

        if (isMoreThanWeekAgo) {
            entries.splice(i, 1);
        }
    }
}

export {
    addGymExerciseEntry,
    addGymExerciseEntryQuery,
    IAddGymExerciseEntryResponse,
};
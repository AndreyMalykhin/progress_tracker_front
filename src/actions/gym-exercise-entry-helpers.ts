import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import Type from "models/type";
import { IConnection, spliceConnection } from "utils/connection";
import makeLog from "utils/make-log";

interface ISpliceGymExerciseEntriesFragment {
    __typename: Type;
    id: string;
    date: number;
}

interface IGetGymExerciseEntriesResponse {
    __typename: Type;
    getGymExerciseEntries:
        IConnection<ISpliceGymExerciseEntriesFragment, number>;
}

const log = makeLog("gym-exercise-entry-helpers");

const getGymExerciseEntriesQuery = gql`
query GetGymExerciseEntries($exerciseId: ID!) {
    getGymExerciseEntries(
        exerciseId: $exerciseId
    ) @connection(key: "getGymExerciseEntries", filter: ["exerciseId"]) {
        edges {
            cursor
            node {
                id
                date
            }
        }
        pageInfo {
            endCursor
        }
    }
}`;

const initGymExerciseEntriesQuery = gql`
query GetGymExerciseEntries($exerciseId: ID) {
    getGymExerciseEntries(
        exerciseId: $exerciseId
    ) @connection(key: "getGymExerciseEntries", filter: ["exerciseId"]) {
        edges {
            cursor
        }
        pageInfo {
            endCursor
            hasNextPage
        }
    }
}`;

function prependGymExerciseEntries(
    entries: ISpliceGymExerciseEntriesFragment[],
    exerciseId: string,
    apollo: DataProxy,
) {
    spliceGymExerciseEntries([], entries, [], exerciseId, apollo);
}

function spliceGymExerciseEntries(
    idsToRemove: string[],
    entriesToPrepend: ISpliceGymExerciseEntriesFragment[],
    entriesToAppend: ISpliceGymExerciseEntriesFragment[],
    exerciseId: string,
    apollo: DataProxy,
) {
    const response = getGymExerciseEntries(exerciseId, apollo);

    if (!response) {
        return;
    }

    const cursorField = "date";
    spliceConnection(
        response.getGymExerciseEntries,
        idsToRemove,
        entriesToPrepend,
        entriesToAppend,
        cursorField,
        Type.GymExerciseEntryEdge,
    );
    setGymExerciseEntries(response, exerciseId, apollo);
}

function getGymExerciseEntries(exerciseId: string, apollo: DataProxy) {
    try {
        return apollo.readQuery<IGetGymExerciseEntriesResponse>({
            query: getGymExerciseEntriesQuery, variables: { exerciseId },
        });
    } catch (e) {
        log.trace("getGymExerciseEntries", "no data");
        return null;
    }
}

function setGymExerciseEntries(
    response: IGetGymExerciseEntriesResponse,
    exerciseId: string,
    apollo: DataProxy,
) {
    apollo.writeQuery({
        data: response,
        query: getGymExerciseEntriesQuery,
        variables: { exerciseId },
    });
}

function initGymExerciseEntries(exerciseId: string, apollo: DataProxy) {
    apollo.writeQuery({
        data: {
            __typename: Type.Query,
            getGymExerciseEntries: {
                __typename: Type.GymExerciseEntryConnection,
                edges: [],
                pageInfo: {
                    __typename: Type.PageInfo,
                    endCursor: null,
                    hasNextPage: false,
                },
            },
        },
        query: initGymExerciseEntriesQuery,
        variables: { exerciseId },
    });
}

export { prependGymExerciseEntries, initGymExerciseEntries };

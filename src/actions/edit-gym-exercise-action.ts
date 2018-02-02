import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import gql from "graphql-tag";
import ProgressDisplayMode from "models/progress-display-mode";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";
import Difficulty from "utils/difficulty";

interface IEditGymExerciseResponse {
    editGymExercise: {
        trackable: {
            id: string;
            title: string;
            iconName: string;
        };
    };
}

interface IEditGymExerciseFragment {
    id: string;
    title?: string;
    iconName?: string;
}

const GymExerciseFragment = gql`
fragment EditGymExerciseFragment on GymExercise {
    id
    title
    iconName
}`;

const editGymExerciseQuery = gql`
${GymExerciseFragment}

mutation EditGymExercise($gymExercise: EditGymExerciseInput!) {
    editGymExercise(gymExercise: $gymExercise) {
        trackable {
            ...EditGymExerciseFragment
        }
    }
}
`;

async function editGymExercise(
    gymExercise: IEditGymExerciseFragment,
    mutate: MutationFunc<IEditGymExerciseResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(gymExercise, apollo),
        variables: { gymExercise },
    });
}

function getOptimisticResponse(
    gymExercise: IEditGymExerciseFragment,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId =
        dataIdFromObject({ __typename: Type.GymExercise, id: gymExercise.id })!;
    const storedGymExercise = apollo.readFragment<IEditGymExerciseFragment>(
        { id: fragmentId, fragment: GymExerciseFragment })!;
    Object.assign(storedGymExercise, gymExercise);
    return {
        __typename: Type.Mutation,
        editGymExercise: {
            __typename: Type.EditGymExerciseResponse,
            trackable: storedGymExercise,
        },
    } as IEditGymExerciseResponse;
}

export {
    editGymExercise,
    editGymExerciseQuery,
    IEditGymExerciseResponse,
    IEditGymExerciseFragment,
};

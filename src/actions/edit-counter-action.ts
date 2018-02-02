import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import gql from "graphql-tag";
import ProgressDisplayMode from "models/progress-display-mode";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";
import Difficulty from "utils/difficulty";

interface IEditCounterResponse {
    editCounter: {
        trackable: {
            id: string;
            title: string;
            iconName: string;
        };
    };
}

interface IEditCounterFragment {
    id: string;
    title?: string;
    iconName?: string;
}

const counterFragment = gql`
fragment EditCounterFragment on Counter {
    id
    title
    iconName
}`;

const editCounterQuery = gql`
${counterFragment}

mutation EditCounter($counter: EditCounterInput!) {
    editCounter(counter: $counter) {
        trackable {
            ...EditCounterFragment
        }
    }
}
`;

async function editCounter(
    counter: IEditCounterFragment,
    mutate: MutationFunc<IEditCounterResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(counter, apollo),
        variables: { counter },
    });
}

function getOptimisticResponse(
    counter: IEditCounterFragment,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId =
        dataIdFromObject({ __typename: Type.Counter, id: counter.id })!;
    const storedCounter = apollo.readFragment<IEditCounterFragment>(
        { id: fragmentId, fragment: counterFragment })!;
    Object.assign(storedCounter, counter);
    return {
        __typename: Type.Mutation,
        editCounter: {
            __typename: Type.EditCounterResponse,
            trackable: storedCounter,
        },
    } as IEditCounterResponse;
}

export {
    editCounter,
    editCounterQuery,
    IEditCounterResponse,
    IEditCounterFragment,
};

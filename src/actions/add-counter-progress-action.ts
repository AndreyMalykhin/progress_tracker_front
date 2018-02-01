import {
    IUpdateProgressFragment,
    updateProgress,
    updateProgressFragment,
} from "actions/aggregate-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";

interface IAddCounterProgressResponse {
    addCounterProgress: {
        trackable: {
            id: string;
            progress: number;
            parent?: {
                id: string;
                progress: number;
            };
        };
    };
}

interface ICounterFragment {
    id: string;
    progress: number;
    parent?: IUpdateProgressFragment;
}

const counterFragment = gql`
${updateProgressFragment}

fragment AddCounterProgressCounterFragment on Counter {
    id
    progress
    parent {
        ...UpdateProgressAggregateFragment
    }
}`;

const addCounterProgressQuery = gql`
mutation AddCounterProgress($id: ID!, $value: Float!) {
    addCounterProgress(id: $id, value: $value) {
        trackable {
            ... on Counter {
                id
                progress
                parent {
                    id
                    progress
                }
            }
        }
    }
}`;

async function addCounterProgress(
    id: string,
    value: number,
    mutate: MutationFunc<IAddCounterProgressResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(id, value, apollo),
        variables: { id, value },
    });
}

function getOptimisticResponse(
    id: string,
    value: number,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId = dataIdFromObject({ __typename: Type.Counter, id })!;
    const counter = apollo.readFragment<ICounterFragment>({
        fragment: counterFragment,
        fragmentName: "AddCounterProgressCounterFragment",
        id: fragmentId,
    })!;
    counter.progress += value;

    if (counter.parent) {
        updateProgress(counter.parent);
    }

    return {
        __typename: Type.Mutation,
        addCounterProgress: {
            __typename: Type.AddCounterProgressResponse,
            trackable: counter,
        },
    } as IAddCounterProgressResponse;
}

export {
    addCounterProgress,
    addCounterProgressQuery,
    IAddCounterProgressResponse,
};

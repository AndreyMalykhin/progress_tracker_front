import { spliceActiveTrackables } from "actions/active-trackables-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";

interface IBreakAggregateResponse {
    breakAggregate: {
        trackables: Array<{
            __typename: Type;
            id: string;
            parent: null;
            order: number;
        }>;
    };
}

interface IAggregateFragment {
    id: string;
    children: Array<{
        __typename: Type;
        id: string;
        order: number;
        parent: null | {
            id: string;
        };
    }>;
}

const breakAggregateQuery = gql`
mutation BreakAggregate($id: ID!) {
    breakAggregate(id: $id) {
        trackables {
            id
            order
            ... on IAggregatable {
                parent {
                    id
                }
            }
        }
    }
}`;

const aggregateFragment = gql`
fragment BreakAggregateFragment on Aggregate {
    id
    children {
        id
        order
        ... on IAggregatable {
            parent {
                id
            }
        }
    }
}`;

async function breakAggregate(
    id: string,
    mutate: MutationFunc<IBreakAggregateResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(id, apollo),
        update: (proxy, response) => {
            updateActiveTrackables(id, response.data, proxy);
        },
        variables: { id },
    });
}

function updateActiveTrackables(
    aggregateId: string, response: IBreakAggregateResponse, apollo: DataProxy) {
    const idsToRemove = [aggregateId];
    const trackablesToAdd = response.breakAggregate.trackables;
    spliceActiveTrackables(idsToRemove, trackablesToAdd, apollo);
}

function getOptimisticResponse(
    aggregateId: string, apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId =
        dataIdFromObject({ __typename: Type.Aggregate, id: aggregateId })!;
    const aggregate = apollo.readFragment<IAggregateFragment>(
        { id: fragmentId, fragment: aggregateFragment })!;

    for (const child of aggregate.children) {
        child.parent = null;
    }

    return {
        __typename: Type.Mutation,
        breakAggregate: {
            __typename: Type.BreakAggregateResponse,
            trackables: aggregate.children,
        },
    } as IBreakAggregateResponse;
}

export { breakAggregate, breakAggregateQuery, IBreakAggregateResponse };

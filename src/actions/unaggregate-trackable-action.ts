import { spliceActiveTrackables } from "actions/active-trackables-helpers";
import {
    IRemoveChildFragment,
    removeChild,
    removeChildFragment,
} from "actions/aggregate-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";

interface IUnaggregateTrackableResponse {
    unaggregateTrackable: {
        removedAggregateId?: string;
        aggregate?: {
            id: string;
            progress: number;
            children: Array<{
                id: string;
            }>;
        },
        trackable: {
            __typename: Type;
            id: string;
            parent: null;
            order: number;
        };
    };
}

interface IGetTrackableByIdResponse {
    getTrackable: {
        __typename: Type;
        id: string;
        parent: IRemoveChildFragment;
        order: number;
    };
}

const unaggregateTrackableQuery = gql`
mutation UnaggregateTrackable($id: ID!) {
    unaggregateTrackable(id: $id) {
        removedAggregateId
        aggregate {
            id
            progress
            children {
                id
            }
        }
        trackable {
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

const getTrackableQuery = gql`
${removeChildFragment}

query GetTrackableById($id: ID!) {
    getTrackable(id: $id) {
        id
        order
        ... on IAggregatable {
            parent {
                ...RemoveChildAggregateFragment
            }
        }
    }
}`;

async function unaggregateTrackable(
    id: string,
    mutate: MutationFunc<IUnaggregateTrackableResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    return await mutate({
        optimisticResponse: getOptimisticResponse(id, apollo),
        update: (proxy, response) => {
            updateActiveTrackables(
                response.data as IUnaggregateTrackableResponse, proxy);
        },
        variables: { id },
    });
}

function updateActiveTrackables(
    response: IUnaggregateTrackableResponse, apollo: DataProxy,
) {
    const { trackable, removedAggregateId } = response.unaggregateTrackable;
    const trackablesToAdd = [trackable];
    const idsToRemove = [];

    if (removedAggregateId) {
        idsToRemove.push(removedAggregateId);
    }

    spliceActiveTrackables(idsToRemove, trackablesToAdd, apollo);
}

function getOptimisticResponse(
    id: string, apollo: ApolloClient<NormalizedCacheObject>,
) {
    const trackableByIdResponse = apollo.readQuery<IGetTrackableByIdResponse>(
        { query: getTrackableQuery, variables: { id } })!;
    const trackable = trackableByIdResponse.getTrackable;
    const { order, parent, __typename } = trackable;
    const removedAggregateId = removeChild(id, parent) ? parent.id : null;
    return {
        __typename: Type.Mutation,
        unaggregateTrackable: {
            __typename: Type.UnaggregateTrackableResponse,
            aggregate: removedAggregateId ? null : parent,
            removedAggregateId,
            trackable: {
                __typename,
                id,
                order,
                parent: null,
            },
        },
    } as IUnaggregateTrackableResponse;
}

export {
    unaggregateTrackable,
    unaggregateTrackableQuery,
    IUnaggregateTrackableResponse,
};

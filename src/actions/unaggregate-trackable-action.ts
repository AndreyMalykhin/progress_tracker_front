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
import myId from "utils/my-id";

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
    getTrackableById: {
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

const getTrackableByIdQuery = gql`
${removeChildFragment}

query GetTrackableById($id: ID!) {
    getTrackableById(id: $id) {
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
    await mutate({
        optimisticResponse: getOptimisticResponse(id, apollo),
        update: (proxy, response) => {
            updateActiveTrackables(response.data, proxy);
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
        { query: getTrackableByIdQuery, variables: { id } })!;
    const trackable = trackableByIdResponse.getTrackableById;
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

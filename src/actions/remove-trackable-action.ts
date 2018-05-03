import { removeActiveTrackables } from "actions/active-trackables-helpers";
import {
    IUpdateAggregateFragment, removeChild, updateAggregateFragment,
} from "actions/aggregate-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";

interface IRemoveTrackableResponse {
    removeTrackable: {
        removedAggregateId?: string;
        aggregate?: {
            id: string;
            progress: number;
            children: Array<{
                id: string;
            }>;
        };
    };
}

interface IGetTrackableByIdResponse {
    getTrackable: {
        __typename: Type;
        id: string;
        parent?: IUpdateAggregateFragment;
    };
}

const removeTrackableQuery = gql`
mutation RemoveTrackable($id: ID!) {
    removeTrackable(id: $id) {
        removedAggregateId
        aggregate {
            id
            progress
            children {
                id
            }
        }
    }
}`;

const getTrackableQuery = gql`
${updateAggregateFragment}

query GetTrackableById($id: ID!) {
    getTrackable(id: $id) {
        id
        ... on IAggregatable {
            parent {
                ...UpdateAggregateFragment
            }
        }
    }
}`;

async function removeTrackable(
    id: string,
    mutate: MutationFunc<IRemoveTrackableResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    return await mutate({
        optimisticResponse: getOptimisticResponse(id, apollo),
        update: (proxy, response) => {
            updateActiveTrackables(
                id, response.data as IRemoveTrackableResponse, proxy);
        },
        variables: { id },
    });
}

function updateActiveTrackables(
    trackableId: string, response: IRemoveTrackableResponse, apollo: DataProxy,
) {
    const { removedAggregateId } = response.removeTrackable;
    const idsToRemove = [trackableId];

    if (removedAggregateId) {
        idsToRemove.push(removedAggregateId);
    }

    removeActiveTrackables(idsToRemove, apollo);
}

function getOptimisticResponse(
    trackableId: string, apollo: ApolloClient<NormalizedCacheObject>,
) {
    const trackableByIdResponse = apollo.readQuery<IGetTrackableByIdResponse>(
        { query: getTrackableQuery, variables: { id: trackableId } })!;
    const parent = trackableByIdResponse.getTrackable.parent || null;
    const removedAggregateId =
        parent && !removeChild(parent, trackableId) ? parent.id : null;
    return {
        __typename: Type.Mutation,
        removeTrackable: {
            __typename: Type.RemoveTrackableResponse,
            aggregate: removedAggregateId ? null : parent,
            removedAggregateId,
        },
    } as IRemoveTrackableResponse;
}

export { removeTrackable, removeTrackableQuery, IRemoveTrackableResponse };

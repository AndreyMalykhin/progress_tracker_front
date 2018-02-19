import { spliceActiveTrackables } from "actions/active-trackables-helpers";
import {
    IRemoveChildFragment,
    removeChild,
    removeChildFragment,
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
    getTrackableById: {
        __typename: Type;
        id: string;
        parent?: IRemoveChildFragment;
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

const getTrackableByIdQuery = gql`
${removeChildFragment}

query GetTrackableById($id: ID!) {
    getTrackableById(id: $id) {
        id
        parent {
            ...RemoveChildAggregateFragment
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

    spliceActiveTrackables(idsToRemove, [], apollo);
}

function getOptimisticResponse(
    trackableId: string, apollo: ApolloClient<NormalizedCacheObject>,
) {
    const trackableByIdResponse = apollo.readQuery<IGetTrackableByIdResponse>(
        { query: getTrackableByIdQuery, variables: { id: trackableId } })!;
    const { parent } = trackableByIdResponse.getTrackableById;
    const removedAggregateId =
        parent && removeChild(trackableId, parent) ? parent.id : null;
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

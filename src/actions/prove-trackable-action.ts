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
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import { Config } from "react-native-config";
import { Image } from "react-native-image-crop-picker";
import dataIdFromObject from "utils/data-id-from-object";
import myId from "utils/my-id";

interface IProveTrackableResponse {
    proveTrackable: {
        removedAggregateId?: string;
        aggregate?: {
            id: string;
            progress: number;
            children: Array<{
                id: string;
            }>;
        },
        trackable: {
            id: string;
            proofPhotoUrlSmall: string;
            status: TrackableStatus;
            statusChangeDate: number;
            parent: null;
        },
    };
}

interface IGetTrackableByIdResponse {
    getTrackableById: {
        __typename: Type;
        id: string;
        isPublic: boolean
        proofPhotoUrl?: string;
        status: TrackableStatus;
        statusChangeDate: number;
        parent?: IRemoveChildFragment;
    };
}

const proveTrackableQuery = gql`
mutation ProveTrackable($id: ID!, $assetId: ID!) {
    proveTrackable(id: $id, assetId: $assetId) {
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
            ... on IGoal {
                proofPhotoUrlSmall
            }
            status
            statusChangeDate
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
        isPublic
        ... on IAggregatable {
            parent {
                ...RemoveChildAggregateFragment
            }
        }
    }
}`;

async function proveTrackable(
    id: string,
    photo: Image,
    mutate: MutationFunc<IProveTrackableResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    let assetId;

    try {
        assetId = await uploadAsset(photo.path, photo.mime);
    } catch (e) {
        // TODO
        throw e;
    }

    await mutate({
        optimisticResponse: getOptimisticResponse(id, photo, apollo),
        update: (proxy, response) => {
            updateActiveTrackables(response.data, proxy);
        },
        variables: { id, assetId },
    });
}

async function uploadAsset(filePath: string, mimeType: string) {
    const body = new FormData();
    body.append("file", {
        name: null,
        type: mimeType,
        uri: filePath,
    } as any);
    const response = await fetch(process.env.SERVER_URL + "/assets", {
        body,
        headers: { Authorization: "Bearer TODO" },
        method: "POST",
    });
    const jsonResponse = await response.json();
    return jsonResponse.payload.id;
}

function updateActiveTrackables(
    response: IProveTrackableResponse, apollo: DataProxy,
) {
    const { trackable, removedAggregateId } = response.proveTrackable;
    const idsToRemove = [trackable.id];

    if (removedAggregateId) {
        idsToRemove.push(removedAggregateId);
    }

    spliceActiveTrackables(idsToRemove, [], apollo);
}

function getOptimisticResponse(
    trackableId: string,
    photo: Image,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const trackableByIdResponse = apollo.readQuery<IGetTrackableByIdResponse>(
        { query: getTrackableByIdQuery, variables: { id: trackableId } })!;
    const { parent, isPublic, __typename } =
        trackableByIdResponse.getTrackableById;
    const status =
        isPublic ? TrackableStatus.PendingReview : TrackableStatus.Approved;
    const removedAggregateId =
        parent && removeChild(trackableId, parent) ? parent.id : null;
    return {
        __typename: Type.Mutation,
        proveTrackable: {
            __typename: Type.ProveTrackableResponse,
            aggregate: removedAggregateId ? null : parent,
            removedAggregateId,
            trackable: {
                __typename,
                id: trackableId,
                parent: null,
                proofPhotoUrlSmall: photo.path,
                status,
                statusChangeDate: Date.now(),
            },
        },
    } as IProveTrackableResponse;
}

export { proveTrackable, proveTrackableQuery, IProveTrackableResponse };

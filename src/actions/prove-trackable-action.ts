import { spliceActiveTrackables } from "actions/active-trackables-helpers";
import {
    IRemoveChildFragment,
    removeChild,
    removeChildFragment,
} from "actions/aggregate-helpers";
import { spliceArchivedTrackables } from "actions/archived-trackables-helpers";
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
import uploadFile from "utils/upload-file";

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
            __typename: Type;
            id: string;
            proofPhotoUrlMedium: string;
            status: TrackableStatus;
            statusChangeDate: number;
            parent: null;
            approveCount: number|null;
            rejectCount: number|null;
            rating: number|null;
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
                proofPhotoUrlMedium
                approveCount
                rejectCount
                rating
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
        const response = await uploadFile(photo.path, photo.mime, "/assets");
        assetId = response.payload.id;
    } catch (e) {
        // TODO
        throw e;
    }

    await mutate({
        optimisticResponse: getOptimisticResponse(id, photo, apollo),
        update: (proxy, response) => {
            updateActiveTrackables(response.data, proxy);
            updateApprovedTrackables(response.data, proxy);
        },
        variables: { id, assetId },
    });
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

function updateApprovedTrackables(
    response: IProveTrackableResponse, apollo: DataProxy,
) {
    const trackablesToAdd = [response.proveTrackable.trackable];
    const idsToRemove: string[] = [];
    spliceArchivedTrackables(
        idsToRemove, trackablesToAdd, TrackableStatus.Approved, apollo);
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
                approveCount: status === TrackableStatus.Approved ? null : 0,
                id: trackableId,
                parent: null,
                proofPhotoUrlMedium: photo.path,
                rating: null,
                rejectCount: status === TrackableStatus.Approved ? null : 0,
                status,
                statusChangeDate: Date.now(),
            },
        },
    } as IProveTrackableResponse;
}

export { proveTrackable, proveTrackableQuery, IProveTrackableResponse };

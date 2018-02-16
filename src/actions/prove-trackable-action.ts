import { spliceActiveTrackables } from "actions/active-trackables-helpers";
import {
    IRemoveChildFragment,
    removeChild,
    removeChildFragment,
} from "actions/aggregate-helpers";
import { spliceArchivedTrackables } from "actions/archived-trackables-helpers";
import {
    splicePendingReviewTrackables,
} from "actions/pending-review-trackables-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Audience from "models/audience";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import { Image } from "react-native-image-crop-picker";
import dataIdFromObject from "utils/data-id-from-object";
import makeLog from "utils/make-log";
import uploadFile from "utils/upload-file";

const log = makeLog("prove-trackable-action");

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
            isReviewed: null;
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
                isReviewed
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
    log("proveTrackable(); request");
    let assetId;

    try {
        const response = await uploadFile(photo.path, photo.mime, "/assets");
        assetId = response.payload.id;
    } catch (e) {
        // TODO
        throw e;
    }

    const result = await mutate({
        optimisticResponse: getOptimisticResponse(id, photo, apollo),
        update: (proxy, response) => {
            log("proveTrackable(); response");
            const responseData = response.data as IProveTrackableResponse;
            updateActiveTrackables(responseData, proxy);
            const trackableStatus =
                responseData.proveTrackable.trackable.status;

            if (trackableStatus === TrackableStatus.Approved) {
                updateApprovedTrackables(responseData, proxy);
            } else if (trackableStatus === TrackableStatus.PendingReview) {
                updatePendingReviewTrackables(responseData, proxy);
            }
        },
        variables: { id, assetId },
    });
    return result.data;
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

function updatePendingReviewTrackables(
    response: IProveTrackableResponse, apollo: DataProxy,
) {
    const trackablesToAdd = [response.proveTrackable.trackable];
    const idsToRemove: string[] = [];
    splicePendingReviewTrackables(
        idsToRemove, trackablesToAdd, Audience.Me, apollo);
}

function getOptimisticResponse(
    trackableId: string,
    photo: Image,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const trackable = apollo.readQuery<IGetTrackableByIdResponse>({
        query: getTrackableByIdQuery,
        variables: { id: trackableId },
    })!.getTrackableById;
    const { parent, isPublic, __typename } = trackable;
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
                isReviewed: null,
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

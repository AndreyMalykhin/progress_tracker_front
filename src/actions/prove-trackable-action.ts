import { removeActiveTrackables } from "actions/active-trackables-helpers";
import {
    IUpdateAggregateFragment, setChildStatus, updateAggregateFragment,
} from "actions/aggregate-helpers";
import { prependArchivedTrackables } from "actions/archived-trackables-helpers";
import {
    appendPendingReviewTrackables,
} from "actions/pending-review-trackables-helpers";
import { getSession } from "actions/session-helpers";
import { uploadAsset } from "actions/upload-asset-action";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient, ApolloError } from "apollo-client";
import gql from "graphql-tag";
import Audience from "models/audience";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import { Image } from "react-native-image-crop-picker";
import dataIdFromObject from "utils/data-id-from-object";
import { IEnvConfig } from "utils/env-config";
import makeLog from "utils/make-log";

const log = makeLog("prove-trackable-action");

interface IProveTrackableResponse {
    proveTrackable: {
        removedAggregateId?: string;
        trackable: {
            __typename: Type;
            id: string;
            myReviewStatus: null;
            proofPhotoUrlMedium: string;
            status: TrackableStatus;
            statusChangeDate: number;
            parent: { id: string; } | null;
            approveCount: number|null;
            rejectCount: number|null;
            rating: number|null;
        },
    };
}

interface IGetTrackableByIdResponse {
    getTrackable: {
        __typename: Type;
        id: string;
        status: TrackableStatus;
        isPublic: boolean
        parent: IUpdateAggregateFragment | null;
    };
}

const proveTrackableQuery = gql`
mutation ProveTrackable($id: ID!, $assetId: ID!) {
    proveTrackable(id: $id, assetId: $assetId) {
        removedAggregateId
        trackable {
            id
            ... on IGoal {
                myReviewStatus
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

const getTrackableQuery = gql`
${updateAggregateFragment}

query GetTrackableById($id: ID!) {
    getTrackable(id: $id) {
        id
        isPublic
        ... on IAggregatable {
            parent {
                ...UpdateAggregateFragment
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
    const uploadResult = await uploadAsset(photo.path, photo.mime, apollo);
    const { id: assetId, urlMedium: assetUrl } =
        uploadResult.uploadAsset.asset;
    const proveResult = await mutate({
        optimisticResponse: getOptimisticResponse(id, assetUrl, apollo),
        update: (proxy, response) => {
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
    return proveResult.data as IProveTrackableResponse;
}

function updateActiveTrackables(
    response: IProveTrackableResponse, apollo: DataProxy,
) {
    const { trackable, removedAggregateId } = response.proveTrackable;
    const idsToRemove = [trackable.id];

    if (removedAggregateId) {
        idsToRemove.push(removedAggregateId);
    }

    removeActiveTrackables(idsToRemove, apollo);
}

function updateApprovedTrackables(
    response: IProveTrackableResponse, apollo: DataProxy,
) {
    prependArchivedTrackables(
        [response.proveTrackable.trackable], TrackableStatus.Approved, apollo);
}

function updatePendingReviewTrackables(
    response: IProveTrackableResponse, apollo: DataProxy,
) {
    appendPendingReviewTrackables(
        [response.proveTrackable.trackable], Audience.Me, apollo);
}

function getOptimisticResponse(
    trackableId: string,
    proofPhotoUrlMedium: string,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const trackable = apollo.readQuery<IGetTrackableByIdResponse>({
        query: getTrackableQuery,
        variables: { id: trackableId },
    })!.getTrackable;
    const { parent, isPublic, __typename } = trackable;
    const status =
        isPublic ? TrackableStatus.PendingReview : TrackableStatus.Approved;
    const removedAggregateId = parent &&
        !setChildStatus(parent, trackableId, status) ? parent.id : null;
    return {
        __typename: Type.Mutation,
        proveTrackable: {
            __typename: Type.ProveTrackableResponse,
            removedAggregateId,
            trackable: {
                __typename,
                approveCount: status === TrackableStatus.Approved ? null : 0,
                id: trackableId,
                isPublic,
                myReviewStatus: null,
                parent: removedAggregateId ? null : parent,
                proofPhotoUrlMedium,
                rating: null,
                rejectCount: status === TrackableStatus.Approved ? null : 0,
                status,
                statusChangeDate: Date.now(),
            },
        },
    } as IProveTrackableResponse;
}

export { proveTrackable, proveTrackableQuery, IProveTrackableResponse };

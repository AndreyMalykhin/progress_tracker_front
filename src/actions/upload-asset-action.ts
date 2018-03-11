import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { IEnvConfig } from "utils/env-config";
import uuid from "utils/uuid";

interface IUploadAssetResponse {
    uploadAsset: {
        asset: {
            id: string;
            urlMedium: string;
        };
    };
}

const uploadAssetOperationName = "UploadAsset";
const uploadAssetQuery = gql`
mutation ${uploadAssetOperationName}($filePath: String!, $mimeType: String!) {
    uploadAsset(filePath: $filePath, mimeType: $mimeType) {
        asset {
            id
            urlMedium
        }
    }
}`;

async function uploadAsset(
    filePath: string,
    mimeType: string,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const response = await apollo.mutate({
        mutation: uploadAssetQuery,
        optimisticResponse: getOptimisticResponse(filePath),
        variables: { filePath, mimeType },
    });
    return response.data as IUploadAssetResponse;
}

function getOptimisticResponse(filePath: string) {
    return {
        __typename: Type.Mutation,
        uploadAsset: {
            __typename: Type.UploadAssetResponse,
            asset: {
                __typename: Type.Asset,
                id: uuid(),
                urlMedium: filePath,
            },
        },
    } as IUploadAssetResponse;
}

export { uploadAsset, uploadAssetOperationName };

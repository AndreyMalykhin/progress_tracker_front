import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { IEnvConfig } from "utils/env-config";
import uuid from "utils/uuid";

interface IUploadAvatarResponse {
    uploadAvatar: {
        avatar: {
            id: string;
            urlSmall: string;
            urlMedium: string;
        };
    };
}

const uploadAvatarOperationName = "UploadAvatar";
const uploadAvatarQuery = gql`
mutation ${uploadAvatarOperationName}(
    $filePath: String!, $mimeType: String!, $id: ID
) {
    uploadAvatar(filePath: $filePath, mimeType: $mimeType, id: $id) {
        avatar {
            id
            urlSmall
            urlMedium
        }
    }
}`;

async function uploadAvatar(
    filePath: string,
    mimeType: string,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const optimisticResponse = getOptimisticResponse(filePath);
    const response = await apollo.mutate({
        mutation: uploadAvatarQuery,
        optimisticResponse,
        variables: {
            filePath,
            id: optimisticResponse.uploadAvatar.avatar.id,
            mimeType,
        },
    });
    return response.data as IUploadAvatarResponse;
}

function getOptimisticResponse(filePath: string) {
    return {
        __typename: Type.Mutation,
        uploadAvatar: {
            __typename: Type.UploadAvatarResponse,
            avatar: {
                __typename: Type.Avatar,
                id: uuid(),
                urlMedium: filePath,
                urlSmall: filePath,
            },
        },
    } as IUploadAvatarResponse;
}

export { uploadAvatar, uploadAvatarOperationName };

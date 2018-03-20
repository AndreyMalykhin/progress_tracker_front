import {
    editUserFragment,
    editUserQuery,
    IEditUserFragment,
    IEditUserResponse,
} from "actions/edit-user-action";
import { getSession } from "actions/session-helpers";
import { uploadAvatar } from "actions/upload-avatar-action";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import { Image } from "react-native-image-crop-picker";
import dataIdFromObject from "utils/data-id-from-object";
import { IEnvConfig } from "utils/env-config";
import makeLog from "utils/make-log";

interface ISetUserAvatarResponse {
    setUserAvatar: {
        user: ISetUserAvatarFragment;
    };
}

interface ISetUserAvatarFragment {
    id: string;
    avatarUrlSmall: string;
    avatarUrlMedium: string;
}

const log = makeLog("set-user-avatar-action");

const setUserAvatarFragment = gql`
fragment SetUserAvatarFragment on User {
    id
    avatarUrlSmall
    avatarUrlMedium
}`;

const setUserAvatarQuery = gql`
${setUserAvatarFragment}

mutation SetUserAvatar($avatarId: ID) {
    setUserAvatar(avatarId: $avatarId) {
        user {
            ...SetUserAvatarFragment
        }
    }
}`;

async function setUserAvatar(
    img: Image|null,
    mutate: MutationFunc<ISetUserAvatarResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    let avatarId;
    let avatarUrlSmall;
    let avatarUrlMedium;

    if (img) {
        const uploadResponse = await uploadAvatar(img.path, img.mime, apollo);
        const { avatar } = uploadResponse.uploadAvatar;
        avatarId = avatar.id;
        avatarUrlSmall = avatar.urlSmall;
        avatarUrlMedium = avatar.urlMedium;
    }

    const response = await mutate({
        optimisticResponse: getOptimisticResponse(
            apollo, avatarUrlSmall, avatarUrlMedium),
        variables: { avatarId },
    });
    return response.data as ISetUserAvatarResponse;
}

function getOptimisticResponse(
    apollo: ApolloClient<NormalizedCacheObject>,
    imgUrlSmall?: string,
    imgUrlMedium?: string,
) {
    const fragmentId = dataIdFromObject(
        { __typename: Type.User, id: getSession(apollo).userId })!;
    const user = apollo.readFragment<ISetUserAvatarFragment>(
        { id: fragmentId, fragment: setUserAvatarFragment })!;
    user.avatarUrlSmall = imgUrlSmall || "";
    user.avatarUrlMedium = imgUrlMedium || "";
    return {
        __typename: Type.Mutation,
        setUserAvatar: {
            __typename: Type.SetUserAvatarResponse,
            user,
        },
    } as ISetUserAvatarResponse;
}

export { setUserAvatar, setUserAvatarQuery, ISetUserAvatarResponse };

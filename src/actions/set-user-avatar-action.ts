import {
    editUserFragment,
    editUserQuery,
    IEditUserFragment,
    IEditUserResponse,
} from "actions/edit-user-action";
import { getSession } from "actions/session-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import { Image } from "react-native-image-crop-picker";
import dataIdFromObject from "utils/data-id-from-object";
import defaultAvatar from "utils/default-avatar";
import uploadFile from "utils/upload-file";

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

    if (img) {
        const response =
            await uploadFile(img.path, img.mime, "/avatars", apollo);

        if (response.status !== 200) {
            throw new Error("File upload failed");
        }

        avatarId = response.payload.id;
    }

    return await mutate({
        optimisticResponse: getOptimisticResponse(img, apollo),
        variables: { avatarId },
    });
}

function getOptimisticResponse(
    img: Image|null, apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId = dataIdFromObject(
        { __typename: Type.User, id: getSession(apollo).userId })!;
    const user = apollo.readFragment<ISetUserAvatarFragment>(
        { id: fragmentId, fragment: setUserAvatarFragment })!;
    user.avatarUrlSmall = img ? img.path : defaultAvatar.urlSmall;
    user.avatarUrlMedium = img ? img.path : defaultAvatar.urlMedium;
    return {
        __typename: Type.Mutation,
        setUserAvatar: {
            __typename: Type.SetUserAvatarResponse,
            user,
        },
    } as ISetUserAvatarResponse;
}

export { setUserAvatar, setUserAvatarQuery, ISetUserAvatarResponse };

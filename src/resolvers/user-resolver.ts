import Type from "models/type";
import defaultAvatar from "utils/default-avatar";
import myId from "utils/my-id";

export default {
    defaults: {
        user: {
            __typename: Type.User,
            accessToken: null,
            avatarUrlMedium: defaultAvatar.urlMedium,
            avatarUrlSmall: defaultAvatar.urlSmall,
            id: myId,
            isReported: false,
            name: "Anonymous",
            rating: 0,
        },
    },
    resolvers: {},
};

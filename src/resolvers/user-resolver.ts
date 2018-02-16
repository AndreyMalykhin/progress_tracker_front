import Type from "models/type";
import defaultAvatar from "utils/default-avatar";
import defaultId from "utils/default-id";

export default {
    defaults: {
        user: {
            __typename: Type.User,
            avatarUrlMedium: defaultAvatar.urlMedium,
            avatarUrlSmall: defaultAvatar.urlSmall,
            id: defaultId,
            isReported: false,
            name: "Anonymous",
            rating: 0,
            rewardableReviewsLeft: 4,
        },
    },
    resolvers: {},
};

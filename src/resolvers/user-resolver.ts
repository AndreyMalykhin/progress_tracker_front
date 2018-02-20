import Type from "models/type";
import IStateResolver from "resolvers/state-resolver";
import defaultAvatar from "utils/default-avatar";
import defaultId from "utils/default-id";

const userResolver: IStateResolver = {
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

export default userResolver;

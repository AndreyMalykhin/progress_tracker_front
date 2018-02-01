import Type from "models/type";
import myId from "utils/my-id";

export default {
    defaults: {
        settings: {
            __typename: Type.Settings,
            id: myId,
            locale: null,
            showIntro: true,
        },
    },
    resolvers: {},
};

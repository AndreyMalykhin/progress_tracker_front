import Type from "models/type";
import defaultId from "utils/default-id";

export default {
    defaults: {
        settings: {
            __typename: Type.Settings,
            id: defaultId,
            locale: null,
            showIntro: true,
        },
    },
    resolvers: {},
};

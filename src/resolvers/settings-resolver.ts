import Type from "utils/type";

export default {
    defaults: {
        settings: {
            __typename: Type.Settings,
            locale: null,
            showIntro: true,
        },
    },
    resolvers: {},
};

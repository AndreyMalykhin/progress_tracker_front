import { ApolloCacheClient } from "apollo-link-state";

export default {
    defaults: {
        settings: {
            __typename: "Settings",
            locale: null,
            showIntro: true,
        },
    },
    resolvers: {},
};

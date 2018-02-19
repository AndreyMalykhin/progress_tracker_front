import Type from "models/type";
import defaultId from "utils/default-id";

export default {
    defaults: {
        ui: {
            __typename: Type.UI,
            id: defaultId,
            isContextMode: false,
            toasts: [],
        },
    },
    resolvers: {},
};

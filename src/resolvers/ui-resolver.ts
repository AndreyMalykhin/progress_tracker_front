import Type from "models/type";
import IStateResolver from "resolvers/state-resolver";
import defaultId from "utils/default-id";

const uiResolver: IStateResolver = {
    defaults: {
        ui: {
            __typename: Type.UI,
            id: defaultId,
            toasts: [],
        },
    },
    nonPersistentDefaults: {
        ui: {
            __typename: Type.UI,
            id: defaultId,
            isContextMode: false,
        },
    },
    resolvers: {},
};

export default uiResolver;

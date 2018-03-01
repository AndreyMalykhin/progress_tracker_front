import Type from "models/type";
import IStateResolver from "resolvers/state-resolver";
import defaultId from "utils/default-id";

const offlineResolver: IStateResolver = {
    defaults: {
        offline: {
            __typename: Type.Offline,
            hasOperations: false,
            id: defaultId,
            operations: [],
        },
    },
    nonPersistentDefaults: {
        offline: {
            __typename: Type.Offline,
            id: defaultId,
            isOnline: null,
        },
    },
    resolvers: {},
};

export default offlineResolver;

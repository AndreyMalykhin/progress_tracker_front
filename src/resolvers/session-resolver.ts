import Type from "models/type";
import defaultId from "utils/default-id";

export default {
    defaults: {
        session: {
            __typename: Type.Session,
            accessToken: null,
            id: defaultId,
            userId: defaultId,
        },
    },
    resolvers: {},
};

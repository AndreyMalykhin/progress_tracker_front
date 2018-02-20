import Type from "models/type";
import IStateResolver from "resolvers/state-resolver";
import defaultId from "utils/default-id";

const sessionResolver: IStateResolver = {
    defaults: {
        session: {
            __typename: Type.Session,
            accessToken: null,
            id: defaultId,
            userId: null,
        },
    },
    resolvers: {},
};

export default sessionResolver;

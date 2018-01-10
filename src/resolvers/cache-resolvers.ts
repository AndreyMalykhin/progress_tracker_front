import { CacheResolver } from "apollo-cache-inmemory";
import {
    defaultDataIdFromObject,
} from "apollo-cache-inmemory/lib/inMemoryCache";
import { toIdValue } from "apollo-utilities";
import Type from "utils/type";

export default {
    Query: {
        getUser(rootValue: any, args: any) {
            return toIdValue(defaultDataIdFromObject(
                { id: args.id, __typename: Type.User })!);
        },
    },
};

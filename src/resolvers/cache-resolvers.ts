import { CacheResolver, CacheResolverMap } from "apollo-cache-inmemory";
import { toIdValue } from "apollo-utilities";
import Type from "models/type";
import dataIdFromObject from "utils/data-id-from-object";

const cacheResolvers: CacheResolverMap = {
    Query: {
        getActivityById(rootValue, args) {
            return toIdValue(dataIdFromObject(
                { id: args.id, __typename: Type.TrackableAddedActivity })!);
        },
        getUserById(rootValue, args) {
            return toIdValue(dataIdFromObject(
                { id: args.id, __typename: Type.User })!);
        },
        getTrackableById(rootValue, args) {
            return toIdValue(dataIdFromObject(
                { id: args.id, __typename: Type.Counter })!);
        },
        getTrackablesByIds(rootValue, args) {
            return args.ids.map((id: string) => {
                return toIdValue(dataIdFromObject(
                    { id, __typename: Type.Counter })!);
            });
        },
    },
};

export default cacheResolvers;

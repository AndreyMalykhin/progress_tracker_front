import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import { CacheResolver, CacheResolverMap } from "apollo-cache-inmemory";
import { toIdValue } from "apollo-utilities";
import Type from "models/type";
import dataIdFromObject from "utils/data-id-from-object";

function makeCacheResolver(getCache: () => DataProxy): CacheResolverMap {
    return {
        Query: {
            getActivity(rootValue, args) {
                return toIdValue(dataIdFromObject(
                    { id: args.id, __typename: Type.TrackableAddedActivity })!);
            },
            getUser(rootValue, args) {
                const id = args.id || getSession(getCache()).userId;
                return toIdValue(dataIdFromObject(
                    { id, __typename: Type.User })!);
            },
            getTrackable(rootValue, args) {
                return toIdValue(dataIdFromObject(
                    { id: args.id, __typename: Type.Counter })!);
            },
            getTrackables(rootValue, args) {
                return args.ids.map((id: string) => {
                    return toIdValue(dataIdFromObject(
                        { id, __typename: Type.Counter })!);
                });
            },
        },
    };
}

export { makeCacheResolver };

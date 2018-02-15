import { CacheResolver } from "apollo-cache-inmemory";
import { toIdValue } from "apollo-utilities";
import Type from "models/type";
import dataIdFromObject from "utils/data-id-from-object";

export default {
    Query: {
        getActivityById(rootValue: any, args: any) {
            return toIdValue(dataIdFromObject(
                { id: args.id, __typename: Type.TrackableAddedActivity })!);
        },
        getUserById(rootValue: any, args: any) {
            return toIdValue(dataIdFromObject(
                { id: args.id, __typename: Type.User })!);
        },
        getTrackableById(rootValue: any, args: any) {
            return toIdValue(dataIdFromObject(
                { id: args.id, __typename: Type.Counter })!);
        },
        getTrackablesByIds(rootValue: any, args: any) {
            return args.ids.map((id: string) => {
                return toIdValue(dataIdFromObject(
                    { id, __typename: Type.Counter })!);
            });
        },
    },
};

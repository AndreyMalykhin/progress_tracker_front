import {
    CacheResolverMap,
    IntrospectionFragmentMatcher,
} from "apollo-cache-inmemory";
import { CachePersistor } from "apollo-cache-persist";
import IStateResolver from "resolvers/state-resolver";
import dataIdFromObject from "utils/data-id-from-object";
import fragmentTypes from "utils/fragment-types";
import InMemoryCache from "utils/in-memory-cache";
import makeLog from "utils/make-log";
import { writeDefaults } from "utils/write-defaults";

const log = makeLog("make-cache");

function makeCache(
    stateResolver: IStateResolver, cacheResolver: CacheResolverMap,
) {
    const fragmentMatcher = new IntrospectionFragmentMatcher(
        { introspectionQueryResultData: fragmentTypes as any });
    const { defaults, nonPersistentDefaults } = stateResolver;
    const cache = new InMemoryCache({
        cacheRedirects: cacheResolver,
        dataIdFromObject,
        fragmentMatcher,
        onWriteDefaults:
            (apollo) => writeDefaults(defaults, nonPersistentDefaults, apollo),
    });
    return cache;
}

export default makeCache;

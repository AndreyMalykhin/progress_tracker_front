import { initActiveTrackables } from "actions/active-trackables-helpers";
import { initActivities } from "actions/activity-helpers";
import { initArchivedTrackables } from "actions/archived-trackables-helpers";
import {
    initPendingReviewTrackables,
} from "actions/pending-review-trackables-helpers";
import { DataProxy } from "apollo-cache";
import {
    CacheResolverMap,
    IntrospectionFragmentMatcher,
} from "apollo-cache-inmemory";
import { CachePersistor } from "apollo-cache-persist";
import FSStorage from "redux-persist-fs-storage";
import IStateResolver from "resolvers/state-resolver";
import Config from "utils/config";
import dataIdFromObject from "utils/data-id-from-object";
import fragmentTypes from "utils/fragment-types";
import InMemoryCache from "utils/in-memory-cache";
import makeLog from "utils/make-log";

const log = makeLog("make-cache");

async function makeCache(
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
    const cachePersistor = new CachePersistor({
        cache,
        debug: Config.isDevEnv,
        maxSize: false,
        storage: FSStorage(),
        trigger: "background",
    });

    try {
        /* await cachePersistor.purge(); */
        await cachePersistor.restore();
    } catch (e) {
        log.error("makeCache(); error=%o", e);
        throw e;
    }

    if (await cachePersistor.getSize()) {
        writeNonPersistentDefaults(nonPersistentDefaults, cache);
    } else if (defaults) {
        writeDefaults(defaults, nonPersistentDefaults, cache);
    }

    return cache;
}

function writeDefaults(
    persistentData: any, nonPersistentData: any, cache: DataProxy,
) {
    log.trace("writeDefaults()");

    if (persistentData) {
        cache.writeData({ data: persistentData });
    }

    writeNonPersistentDefaults(nonPersistentData, cache);
    initActiveTrackables(cache);
    initArchivedTrackables(cache);
    initPendingReviewTrackables(cache);
    initActivities(cache);
}

function writeNonPersistentDefaults(data: any, cache: DataProxy) {
    log.trace("writeNonPersistentDefaults()");

    if (data) {
        cache.writeData({ data });
    }
}

export default makeCache;

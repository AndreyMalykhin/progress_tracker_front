import { CachePersistor } from "apollo-cache-persist";
import FSStorage from "redux-persist-fs-storage";
import IStateResolver from "resolvers/state-resolver";
import { IEnvConfig } from "utils/env-config";
import InMemoryCache from "utils/in-memory-cache";
import makeLog from "utils/make-log";
import {
    writeDefaults,
    writeNonPersistentDefaults,
} from "utils/write-defaults";

const log = makeLog("load-cache");

async function loadCache(
    cache: InMemoryCache, stateResolver: IStateResolver, envConfig: IEnvConfig,
) {
    const cachePersistor = new CachePersistor({
        cache,
        debug: envConfig.isDevEnv,
        maxSize: false,
        storage: FSStorage(),
        trigger: "background",
    });

    try {
        /* await cachePersistor.purge(); */
        await cachePersistor.restore();
    } catch (e) {
        log.error("loadCache", e);
        throw e;
    }

    const { defaults, nonPersistentDefaults } = stateResolver;

    if (await cachePersistor.getSize()) {
        writeNonPersistentDefaults(nonPersistentDefaults, cache);
    } else if (defaults) {
        writeDefaults(defaults, nonPersistentDefaults, cache);
    }
}

export default loadCache;

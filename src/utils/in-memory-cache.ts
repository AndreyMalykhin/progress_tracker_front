import {
    InMemoryCache as InMemoryCacheImpl,
} from "apollo-cache-inmemory/lib/inMemoryCache";

class InMemoryCache extends InMemoryCacheImpl {
    public writeDefaults?: () => void;

    public reset() {
        this.data.clear();
        this.writeDefaults ? this.writeDefaults() : this.broadcastWatches();
        return Promise.resolve();
    }
}

export default InMemoryCache;

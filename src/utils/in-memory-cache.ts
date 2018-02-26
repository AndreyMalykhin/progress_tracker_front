import { ApolloReducerConfig } from "apollo-cache-inmemory";
import {
    InMemoryCache as InMemoryCacheImpl,
} from "apollo-cache-inmemory/lib/inMemoryCache";

interface IConfig extends ApolloReducerConfig {
    defaults?: object;
}

class InMemoryCache extends InMemoryCacheImpl {
    private defaults?: object;

    public constructor(config?: IConfig) {
        super(config);
        this.defaults = config && config.defaults;
    }

    public writeDefaults() {
        this.writeData({ data: this.defaults });
    }

    public reset() {
        this.data.clear();
        this.defaults ? this.writeDefaults() : this.broadcastWatches();
        return Promise.resolve();
    }
}

export default InMemoryCache;

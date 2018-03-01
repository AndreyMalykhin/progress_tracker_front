import { ApolloReducerConfig } from "apollo-cache-inmemory";
import {
    InMemoryCache as InMemoryCacheImpl,
} from "apollo-cache-inmemory/lib/inMemoryCache";

interface IConfig extends ApolloReducerConfig {
    onWriteDefaults?: (cache: InMemoryCache) => void;
}

class InMemoryCache extends InMemoryCacheImpl {
    private onWriteDefaults?: (cache: InMemoryCache) => void;

    public constructor(config?: IConfig) {
        super(config);
        this.onWriteDefaults = config && config.onWriteDefaults;
    }

    public async reset() {
        this.data.clear();
        return this.onWriteDefaults ? await this.onWriteDefaults(this) :
            this.broadcastWatches();
    }
}

export default InMemoryCache;

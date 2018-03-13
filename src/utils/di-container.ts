import { CacheResolverMap, NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { ApolloLink } from "apollo-link";
import * as Bottle from "bottlejs";
import { History } from "history";
import DeadlineTracker from "models/deadline-tracker";
import { makeCacheResolver } from "resolvers/cache-resolver";
import makeStateResolver from "resolvers/make-state-resolver";
import IStateResolver from "resolvers/state-resolver";
import AudioManager from "utils/audio-manager";
import { IEnvConfig, makeEnvConfig } from "utils/env-config";
import { makeErrorLink } from "utils/error-link";
import InMemoryCache from "utils/in-memory-cache";
import makeApollo from "utils/make-apollo";
import makeCache from "utils/make-cache";
import MultiStackHistory from "utils/multi-stack-history";
import NetworkTracker from "utils/network-tracker";
import UploadLink from "utils/upload-link";

class DIContainer {
    private impl: Bottle.IContainer;

    public constructor(impl: Bottle.IContainer) {
        this.impl = impl;
    }

    public get history(): History {
        return this.impl.history;
    }

    public get stateResolver(): IStateResolver {
        return this.impl.stateResolver;
    }

    public get cacheResolver(): typeof makeCacheResolver {
        return this.impl.cacheResolver;
    }

    public get cache(): InMemoryCache {
        return this.impl.cache;
    }

    public get apollo(): ApolloClient<NormalizedCacheObject> {
        return this.impl.apollo;
    }

    public get deadlineTracker(): DeadlineTracker {
        return this.impl.deadlineTracker;
    }

    public get networkTracker(): NetworkTracker {
        return this.impl.networkTracker;
    }

    public get envConfig(): IEnvConfig {
        return this.impl.envConfig;
    }

    public get audioManager(): AudioManager {
        return this.impl.audioManager;
    }

    public get errorLink(): ApolloLink {
        return this.impl.errorLink;
    }

    public get uploadLink(): UploadLink {
        return this.impl.uploadLink;
    }
}

function makeDIContainer() {
    const di = new Bottle();
    di.service("audioManager", AudioManager);
    di.service("deadlineTracker", DeadlineTracker, "apollo", "envConfig");
    di.service("networkTracker", NetworkTracker, "apollo", "envConfig");
    di.service("history", MultiStackHistory);
    di.service("uploadLink", UploadLink, "envConfig");
    di.factory("envConfig", makeEnvConfig);
    di.factory("stateResolver", makeStateResolver);
    di.factory("cacheResolver", (container) => {
        return makeCacheResolver(() => container.apollo);
    });
    di.serviceFactory("errorLink", makeErrorLink);
    di.serviceFactory("cache", makeCache, "stateResolver", "cacheResolver");
    di.serviceFactory(
        "apollo",
        makeApollo,
        "cache",
        "stateResolver",
        "envConfig",
        "errorLink",
        "uploadLink",
    );
    return new DIContainer(di.container);
}

export { makeDIContainer };
export default DIContainer;

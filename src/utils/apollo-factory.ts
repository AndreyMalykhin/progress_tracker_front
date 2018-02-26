import {
    CacheResolverMap,
    IntrospectionFragmentMatcher,
    NormalizedCacheObject,
} from "apollo-cache-inmemory";
import { CachePersistor } from "apollo-cache-persist";
import { ApolloClient } from "apollo-client";
import { ApolloLink, FetchResult, Observable, Operation } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import apolloLogger from "apollo-link-logger";
import { withClientState } from "apollo-link-state";
import { InjectedIntl } from "react-intl";
import { AsyncStorage } from "react-native";
import IStateResolver from "resolvers/state-resolver";
import AnonymousLink from "utils/anonymous-link";
import AuthLink from "utils/auth-link";
import Config from "utils/config";
import dataIdFromObject from "utils/data-id-from-object";
import ErrorLink from "utils/error-link";
import fragmentTypes from "utils/fragment-types";
import InMemoryCache from "utils/in-memory-cache";
import makeLog from "utils/make-log";

const log = makeLog("apollo-factory");

async function apolloFactory(
    stateResolver: IStateResolver, cacheResolver: CacheResolverMap,
) {
    const fragmentMatcher = new IntrospectionFragmentMatcher(
        { introspectionQueryResultData: fragmentTypes as any });
    const cache = new InMemoryCache({
        cacheRedirects: cacheResolver,
        dataIdFromObject,
        defaults: stateResolver.defaults,
        fragmentMatcher,
    });
    const cachePersistor = new CachePersistor({
        cache,
        debug: Config.isDevEnv,
        maxSize: false,
        storage: AsyncStorage as any,
        trigger: "background",
    });

    try {
        /* await cachePersistor.purge(); */
        await cachePersistor.restore();
    } catch (e) {
        log.error("apolloFactory(); error=%o", e);
        throw e;
    }

    if (stateResolver.defaults && !await cachePersistor.getSize()) {
        cache.writeDefaults();
    }

    const stateLink = withClientState(
        { cache, resolvers: stateResolver.resolvers });
    const links = [
        ErrorLink,
        AnonymousLink,
        stateLink,
        AuthLink,
        new HttpLink({ uri: Config.serverUrl + "/graphql" }),
    ];

    if (Config.isDevEnv) {
        links.unshift(apolloLogger);
    }

    return new ApolloClient<NormalizedCacheObject>({
        cache,
        link: ApolloLink.from(links),
    });
}

export default apolloFactory;

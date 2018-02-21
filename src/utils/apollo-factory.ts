import {
    CacheResolverMap,
    IntrospectionFragmentMatcher,
    NormalizedCacheObject,
} from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { ApolloLink, FetchResult, Observable, Operation } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import apolloLogger from "apollo-link-logger";
import { withClientState } from "apollo-link-state";
import { InjectedIntl } from "react-intl";
import IStateResolver from "resolvers/state-resolver";
import AuthLink from "utils/auth-link";
import Config from "utils/config";
import dataIdFromObject from "utils/data-id-from-object";
import ErrorLink from "utils/error-link";
import fragmentTypes from "utils/fragment-types";
import InMemoryCache from "utils/in-memory-cache";
import makeLog from "utils/make-log";

const log = makeLog("apollo-factory");

function apolloFactory(
    stateResolver: IStateResolver, cacheResolver: CacheResolverMap,
) {
    const fragmentMatcher = new IntrospectionFragmentMatcher(
        { introspectionQueryResultData: fragmentTypes as any });
    const cache = new InMemoryCache(
        { cacheRedirects: cacheResolver, dataIdFromObject, fragmentMatcher });
    const stateLink = withClientState({
        cache: cache as any,
        ...stateResolver,
    });
    cache.writeDefaults = () => stateLink.writeDefaults();
    const links = [
        ErrorLink,
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

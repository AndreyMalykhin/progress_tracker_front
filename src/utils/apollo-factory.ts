import { IntrospectionFragmentMatcher, NormalizedCacheObject } from "apollo-cache-inmemory";
import { InMemoryCache } from "apollo-cache-inmemory/lib/inMemoryCache";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import apolloLogger from "apollo-link-logger";
import { withClientState } from "apollo-link-state";
import { InjectedIntl } from "react-intl";
import cacheResolvers from "resolvers/cache-resolvers";
import stateResolvers from "resolvers/state-resolvers";
import AuthLink from "utils/auth-link";
import Config from "utils/config";
import dataIdFromObject from "utils/data-id-from-object";
import ErrorLink from "utils/error-link";
import fragmentTypes from "utils/fragment-types";

function apolloFactory() {
    const fragmentMatcher = new IntrospectionFragmentMatcher(
        { introspectionQueryResultData: fragmentTypes as any });
    const cache = new InMemoryCache(
        { cacheRedirects: cacheResolvers, dataIdFromObject, fragmentMatcher });
    const stateLink = withClientState({
        cache: cache as any,
        ...stateResolvers,
    });
    const links = [
        ErrorLink,
        AuthLink,
        stateLink,
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

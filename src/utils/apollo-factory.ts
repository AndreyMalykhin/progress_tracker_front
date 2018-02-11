import { IntrospectionFragmentMatcher } from "apollo-cache-inmemory";
import { InMemoryCache } from "apollo-cache-inmemory/lib/inMemoryCache";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import apolloLogger from "apollo-link-logger";
import { withClientState } from "apollo-link-state";
import cacheResolvers from "resolvers/cache-resolvers";
import stateResolvers from "resolvers/state-resolvers";
import Config from "utils/config";
import dataIdFromObject from "utils/data-id-from-object";
import fragmentTypes from "utils/fragment-types";

function apolloFactory() {
    const fragmentMatcher = new IntrospectionFragmentMatcher(
        { introspectionQueryResultData: fragmentTypes as any });
    const cache = new InMemoryCache(
        { cacheResolvers, dataIdFromObject, fragmentMatcher });
    const stateLink = withClientState({
        cache: cache as any,
        ...stateResolvers,
    });
    const links = [
        stateLink,
        new HttpLink({ uri: Config.serverUrl + "/graphql" }),
    ];

    if (Config.isDevEnv) {
        links.unshift(apolloLogger);
    }

    return new ApolloClient({
        cache,
        link: ApolloLink.from(links),
    });
}

export default apolloFactory;

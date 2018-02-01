import { IntrospectionFragmentMatcher } from "apollo-cache-inmemory";
import { InMemoryCache } from "apollo-cache-inmemory/lib/inMemoryCache";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { withClientState } from "apollo-link-state";
import cacheResolvers from "resolvers/cache-resolvers";
import stateResolvers from "resolvers/state-resolvers";
import dataIdFromObject from "utils/data-id-from-object";
import fragmentTypes from "utils/fragment-types";

export default function() {
    const fragmentMatcher = new IntrospectionFragmentMatcher(
        { introspectionQueryResultData: fragmentTypes as any });
    const cache = new InMemoryCache(
        { cacheResolvers, dataIdFromObject, fragmentMatcher });
    const stateLink = withClientState({
        cache: cache as any,
        ...stateResolvers,
    });
    return new ApolloClient({
        cache,
        link: ApolloLink.from([
            stateLink,
            new HttpLink({ uri: process.env.SERVER_URL + "/graphql" }),
        ]),
    });
}

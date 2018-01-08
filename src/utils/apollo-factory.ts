import { InMemoryCache } from "apollo-cache-inmemory/lib/inMemoryCache";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { withClientState } from "apollo-link-state";
import stateResolvers from "resolvers/state-resolvers";

export default function() {
    const cache = new InMemoryCache();
    const stateLink = withClientState({
        cache: cache as any,
        ...stateResolvers,
    });
    return new ApolloClient({
        cache,
        link: ApolloLink.from([
            stateLink,
            new HttpLink({ uri: "http://localhost:3000/graphql" }),
        ]),
    });
}

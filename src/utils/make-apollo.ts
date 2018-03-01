import { ApolloCache, DataProxy } from "apollo-cache";
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
import { AsyncStorage } from "react-native";
import IStateResolver from "resolvers/state-resolver";
import AuthLink from "utils/auth-link";
import Config from "utils/config";
import ErrorLink from "utils/error-link";
import InMemoryCache from "utils/in-memory-cache";
import makeLog from "utils/make-log";
import OfflineLink from "utils/offline-link";

const log = makeLog("make-apollo");

function makeApollo(cache: ApolloCache<any>, stateResolver: IStateResolver) {
    const offlineLink = new OfflineLink();
    const stateLink = withClientState(
        { cache, resolvers: stateResolver.resolvers });
    const links = [
        ErrorLink,
        offlineLink,
        stateLink,
        AuthLink,
        new HttpLink({ uri: Config.serverUrl + "/graphql" }),
    ];

    if (Config.isDevEnv) {
        links.unshift(apolloLogger);
    }

    const apollo = new ApolloClient<NormalizedCacheObject>(
        { cache, link: ApolloLink.from(links) });
    offlineLink.setApollo(apollo);
    return apollo;
}

export default makeApollo;

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
import authLink from "utils/auth-link";
import { IEnvConfig } from "utils/env-config";
import ErrorLink from "utils/error-link";
import InMemoryCache from "utils/in-memory-cache";
import makeLog from "utils/make-log";
import OfflineLink from "utils/offline-link";
import UploadLink from "utils/upload-link";

const log = makeLog("make-apollo");

function makeApollo(
    cache: ApolloCache<any>,
    stateResolver: IStateResolver,
    envConfig: IEnvConfig,
    errorLink: ErrorLink,
    uploadLink: UploadLink,
) {
    const offlineLink = new OfflineLink(envConfig);
    const stateLink = withClientState(
        { cache, resolvers: stateResolver.resolvers });
    const links = [
        errorLink,
        offlineLink,
        stateLink,
        authLink,
        uploadLink,
        new HttpLink({ uri: envConfig.serverUrl + "/graphql" }),
    ];

    if (envConfig.isDevEnv) {
        links.unshift(apolloLogger);
    }

    // any policy except "none" mitigates error handling bugs in Apollo
    const errorPolicy = "all";
    const apollo = new ApolloClient<NormalizedCacheObject>({
        cache,
        defaultOptions: {
            query: { errorPolicy },
            watchQuery: { errorPolicy },
        },
        link: ApolloLink.from(links),
        queryDeduplication: false, // disabled because it's buggy
    });
    offlineLink.start(apollo);
    return apollo;
}

export default makeApollo;

import "intl";
import en from "messages/en";
import { addLocaleData } from "react-intl";
import * as enLocaleData from "react-intl/locale-data/en";

import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import AppContainer from "components/app-container";
import gql from "graphql-tag";
import { History } from "history";
import { merge } from "lodash";
import DeadlineTracker from "models/deadline-tracker";
import Type from "models/type";
import * as React from "react";
import { ApolloProvider } from "react-apollo";
import { getDeviceLocale } from "react-native-device-info";
import Reactotron from "reactotron-react-native";
import apolloFactory from "utils/apollo-factory";
import Config from "utils/config";
import dataIdFromObject from "utils/data-id-from-object";
import defaultId from "utils/default-id";
import MultiStackHistory from "utils/multi-stack-history";

import { makeCacheResolver } from "resolvers/cache-resolver";
import { makeMessageResolver } from "resolvers/message-resolver";
import sessionResolver from "resolvers/session-resolver";
import { makeSettingsResolver } from "resolvers/settings-resolver";
import uiResolver from "resolvers/ui-resolver";
import userResolver from "resolvers/user-resolver";

class Bootstrap extends React.Component {
    private apollo: ApolloClient<NormalizedCacheObject>;
    private history: History;

    public constructor(props: {}, context: any) {
        super(props, context);
        console.ignoredYellowBox = ["Remote debugger is in"];

        if (Config.isDevEnv) {
            Reactotron.configure().useReactNative().connect();
        }

        this.history = new MultiStackHistory();
        const locale = this.initLocale();
        const stateResolver = merge(
            makeMessageResolver({ en }),
            makeSettingsResolver(locale),
            userResolver,
            sessionResolver,
            uiResolver,
        );
        const cacheResolver = makeCacheResolver(() => this.apollo);
        this.apollo = apolloFactory(stateResolver, cacheResolver);
        new DeadlineTracker(this.apollo).start();
    }

    public render() {
        return (
            <ApolloProvider client={this.apollo}>
                <AppContainer history={this.history} />
            </ApolloProvider>
        );
    }

    private initLocale() {
        addLocaleData(en);
        let locale = getDeviceLocale();
        const isLocaleSupported = ["en"].some(
            (supportedLocale) => locale!.startsWith(supportedLocale));

        if (!isLocaleSupported) {
            locale = "en";
        }

        return locale;
    }
}

export default Bootstrap;

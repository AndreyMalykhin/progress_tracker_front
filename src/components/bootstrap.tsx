import "intl";
import en from "messages/en";
import { addLocaleData } from "react-intl";
import * as enLocaleData from "react-intl/locale-data/en";

import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import * as Bottle from "bottlejs";
import AppContainer from "components/app-container";
import DIContainerProvider from "components/di-container-provider";
import gql from "graphql-tag";
import { History } from "history";
import { merge } from "lodash";
import DeadlineTracker from "models/deadline-tracker";
import Type from "models/type";
import * as React from "react";
import { ApolloProvider } from "react-apollo";
import { getDeviceLocale } from "react-native-device-info";
import Reactotron from "reactotron-react-native";
import IStateResolver from "resolvers/state-resolver";
import dataIdFromObject from "utils/data-id-from-object";
import defaultId from "utils/default-id";
import DIContainer, { makeDIContainer } from "utils/di-container";
import getDefaultLocale from "utils/get-default-locale";
import InMemoryCache from "utils/in-memory-cache";
import loadCache from "utils/load-cache";
import makeApollo from "utils/make-apollo";
import makeCache from "utils/make-cache";
import MultiStackHistory from "utils/multi-stack-history";
import NetworkTracker from "utils/network-tracker";

interface IBootstrapState {
    isDone?: boolean;
}

class Bootstrap extends React.Component<{}, IBootstrapState> {
    public state: IBootstrapState = {};
    private diContainer?: DIContainer;
    private apollo?: ApolloClient<NormalizedCacheObject>;

    public constructor(props: {}, context: any) {
        super(props, context);
    }

    public render() {
        if (!this.state.isDone) {
            return null;
        }

        return (
            <DIContainerProvider container={this.diContainer!}>
                <ApolloProvider client={this.diContainer!.apollo}>
                    <AppContainer
                        history={this.diContainer!.history}
                    />
                </ApolloProvider>
            </DIContainerProvider>
        );
    }

    public async componentWillMount() {
        this.diContainer = makeDIContainer();

        if (this.diContainer.envConfig.isDevEnv) {
            console.ignoredYellowBox = ["Remote debugger is in"];
            Reactotron.configure().useReactNative().connect();
        }

        addLocaleData(en);
        const cache = this.diContainer.cache;
        const stateResolver = this.diContainer.stateResolver;
        const envConfig = this.diContainer.envConfig;

        try {
            await loadCache(cache, stateResolver, envConfig);
        } catch (e) {
            return;
        }

        await this.diContainer.networkTracker.start();
        this.diContainer.deadlineTracker.start();
        this.setState({ isDone: true });
    }
}

export default Bootstrap;

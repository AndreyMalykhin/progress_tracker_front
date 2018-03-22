import "intl";
import en from "messages/en";
import { addLocaleData } from "react-intl";
import * as enLocaleData from "react-intl/locale-data/en";

import { getSession } from "actions/session-helpers";
import { addGenericErrorToast } from "actions/toast-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import * as Bottle from "bottlejs";
import ApolloProvider from "components/apollo-provider";
import AppContainer from "components/app-container";
import DIContainerProvider from "components/di-container-provider";
import gql from "graphql-tag";
import { History } from "history";
import { merge } from "lodash";
import DeadlineTracker from "models/deadline-tracker";
import Type from "models/type";
import * as React from "react";
import { getBuildNumber, getReadableVersion } from "react-native-device-info";
import { Sentry } from "react-native-sentry";
import Reactotron from "reactotron-react-native";
import IStateResolver from "resolvers/state-resolver";
import Analytics from "utils/analytics";
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
import Sound from "utils/sound";

interface IBootstrapState {
    isDone?: boolean;
}

class Bootstrap extends React.Component<{}, IBootstrapState> {
    public state: IBootstrapState = {};
    private diContainer?: DIContainer;
    private apollo?: ApolloClient<NormalizedCacheObject>;
    private messages: { [locale: string]: { [id: string]: string } } = {};

    public render() {
        if (!this.state.isDone) {
            return null;
        }

        return (
            <DIContainerProvider container={this.diContainer!}>
                <ApolloProvider client={this.diContainer!.apollo}>
                    <AppContainer
                        messages={this.messages}
                        history={this.diContainer!.history}
                    />
                </ApolloProvider>
            </DIContainerProvider>
        );
    }

    public async componentWillMount() {
        this.diContainer = makeDIContainer();
        this.initErrorReporting();
        this.initAnalytics();
        this.initDebugging();
        this.initLocalization();

        try {
            await this.initStorage();
        } catch (e) {
            return;
        }

        Sentry.setUserContext(
            { id: getSession(this.diContainer.apollo).userId });
        await this.initAudio();
        await this.diContainer.networkTracker.start();
        await this.diContainer.deadlineTracker.start();
        this.setState({ isDone: true });
    }

    private initLocalization() {
        addLocaleData(enLocaleData);
        this.messages = { en };
    }

    private initDebugging() {
        if (this.diContainer!.envConfig.isDevEnv) {
            console.ignoredYellowBox = ["Remote debugger is in"];
            Reactotron.configure().useReactNative().connect();
        }
    }

    private initErrorReporting() {
        if (!this.diContainer!.envConfig.sentryDsn) {
            return;
        }

        Sentry.config(this.diContainer!.envConfig.sentryDsn).install();
        Sentry.setRelease(`${getReadableVersion()} / ${getBuildNumber()}`);
        Sentry.setTagsContext({
            environment: this.diContainer!.envConfig.env,
        });
    }

    private initAudio() {
        try {
            return this.diContainer!.audioManager.loadAll([
                Sound.Click,
                Sound.GoalAchieve,
                Sound.ProgressChange,
                Sound.Approve,
                Sound.Reject,
                Sound.Remove,
                Sound.Error,
            ]);
        } catch (e) {
            // no op
        }
    }

    private initStorage() {
        const cache = this.diContainer!.cache;
        const stateResolver = this.diContainer!.stateResolver;
        const envConfig = this.diContainer!.envConfig;
        return loadCache(cache, stateResolver, envConfig);
    }

    private initAnalytics() {
        Analytics.setEnabled(!this.diContainer!.envConfig.isAnalyticsDisabled);
    }
}

export default Bootstrap;

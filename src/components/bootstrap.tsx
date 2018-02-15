// tslint:disable-next-line:ordered-imports
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import AppContainer from "components/app-container";
import gql from "graphql-tag";
import { History } from "history";
import "intl";
import DeadlineTracker from "models/deadline-tracker";
import Type from "models/type";
import * as React from "react";
import { ApolloProvider } from "react-apollo";
import { addLocaleData } from "react-intl";
import * as en from "react-intl/locale-data/en";
import { getDeviceLocale } from "react-native-device-info";
import Reactotron from "reactotron-react-native";
import apolloFactory from "utils/apollo-factory";
import Config from "utils/config";
import dataIdFromObject from "utils/data-id-from-object";
import MultiStackHistory from "utils/multi-stack-history";
import myId from "utils/my-id";

interface ISettingsFragment {
    id: string;
    locale?: string;
}

const settingsFragment = gql`
fragment BootstrapSettingsFragment on Settings {
    id
    locale
}`;

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
        this.apollo = apolloFactory();
        new DeadlineTracker(this.apollo).start();
        this.initLocale();
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
        const fragmentId = dataIdFromObject(
            { __typename: Type.Settings, id: myId })!;
        const settings = this.apollo.readFragment<ISettingsFragment>(
            { id: fragmentId, fragment: settingsFragment })!;
        let { locale } = settings;

        if (locale) {
            return;
        }

        locale = getDeviceLocale();
        const isLocaleSupported = ["en"].some(
            (supportedLocale) => locale!.startsWith(supportedLocale));

        if (!isLocaleSupported) {
            locale = "en";
        }

        settings.locale = locale;
        this.apollo.writeFragment(
            { data: settings, id: fragmentId, fragment: settingsFragment });
    }
}

export default Bootstrap;

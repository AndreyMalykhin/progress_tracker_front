// tslint:disable-next-line:ordered-imports
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import App, { IAppProps } from "components/app";
import Error from "components/error";
import Loader from "components/loader";
import withApolloProvider from "components/with-apollo-provider";
import withError from "components/with-error";
import withLoader from "components/with-loader";
import gql from "graphql-tag";
import "intl";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { addLocaleData } from "react-intl";
import * as en from "react-intl/locale-data/en";
import { getDeviceLocale } from "react-native-device-info";
import Reactotron from "reactotron-react-native";
import apolloFactory from "utils/apollo-factory";
import Config from "utils/config";
import { isLoading } from "utils/query-status";
import QueryStatus from "utils/query-status";

interface IGetAppDataResponse {
    getMessages: Array<{
        id: string;
        key: string;
        text: string;
    }>;
}

interface IGetSettingsResponse {
    settings: {
        id: string;
        locale?: string;
    };
}

interface IWithAppDataProps {
    locale: string;
}

function bootstrap(client: ApolloClient<NormalizedCacheObject>) {
    if (Config.isDevEnv) {
        Reactotron.configure().useReactNative().connect();
    }

    console.ignoredYellowBox = ["Remote debugger is in"];
    initLocale(apollo);
}

const getSettingsQuery = gql`
query GetSettings {
    settings @client {
        id
        locale
    }
}`;

function initLocale(client: ApolloClient<NormalizedCacheObject>) {
    addLocaleData(en);
    const settingsResponse =
        apollo.readQuery<IGetSettingsResponse>({ query: getSettingsQuery })!;
    let { locale } = settingsResponse.settings;

    if (locale) {
        return;
    }

    locale = getDeviceLocale();
    const isLocaleSupported = ["en"].some(
        (supportedLocale) => locale!.startsWith(supportedLocale));

    if (!isLocaleSupported) {
        locale = "en";
    }

    settingsResponse.settings.locale = locale;
    apollo.writeQuery({ data: settingsResponse, query: getSettingsQuery });
}

const apollo = apolloFactory();
bootstrap(apollo);

const getAppDataQuery = gql`
query GetAppData($locale: String!) {
    getMessages(locale: $locale) @client {
        id
        key
        text
    }
}`;

const withSettings = graphql<IGetSettingsResponse, {}, IAppProps>(
    getSettingsQuery,
    {
        props: ({ data }) => {
            return {
                locale: data!.settings.locale,
            };
        },
    },
);

const withAppData = graphql<IGetAppDataResponse, IWithAppDataProps, IAppProps>(
    getAppDataQuery,
    {
        options: ({ locale }) => {
            return {
                notifyOnNetworkStatusChange: true,
                variables: { locale },
            };
        },
        props: ({ data }) => {
            const { networkStatus: queryStatus, getMessages } = data!;

            if (queryStatus === QueryStatus.InitialLoading
                || queryStatus === QueryStatus.Error
            ) {
                return { queryStatus };
            }

            const transformedMessages: { [key: string]: string } = {};
            return {
                messages: data!.getMessages.reduce((accumulator, message) => {
                    accumulator[message.key] = message.text;
                    return accumulator;
                }, transformedMessages),
                queryStatus,
            };
        },
    },
);

export default compose(
    withApolloProvider(apollo),
    withSettings,
    withAppData,
    withLoader(Loader),
    withError(Error),
)(App);

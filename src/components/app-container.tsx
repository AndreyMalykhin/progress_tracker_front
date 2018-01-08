import "intl";
// tslint:disable-next-line:ordered-imports
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import App, { IAppProps } from "components/app";
import gql from "graphql-tag";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { addLocaleData } from "react-intl";
import * as en from "react-intl/locale-data/en";
import { getDeviceLocale } from "react-native-device-info";
import apolloFactory from "utils/apollo-factory";
import withApolloProvider from "utils/with-apollo-provider";

interface IGetAppDataResponse {
    messages: Array<{
        key: string;
        text: string;
    }>;
}

interface IGetSettingsResponse {
    settings: {
        locale?: string;
    };
}

interface IWithAppDataProps {
    locale: string;
}

function bootstrap(client: ApolloClient<NormalizedCacheObject>) {
    // Apollo bug workaround
    console.ignoredYellowBox = ["Missing field"];

    initLocale(apollo);
}

const getSettingsQuery = gql`
query GetSettings {
    settings @client {
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

    apollo.writeQuery({
        data: {
            ...settingsResponse,
            settings: { ...settingsResponse.settings, locale },
        },
        query: getSettingsQuery,
    });
}

const apollo = apolloFactory();
bootstrap(apollo);

const getAppDataQuery = gql`
query GetAppData($locale: String!) {
    messages(locale: $locale) @client {
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
                variables: { locale },
            };
        },
        props: ({ data }) => {
            const { loading, error, messages } = data!;

            if (loading) {
                return { loading };
            }

            const transformedMessages: { [key: string]: string } = {};
            return {
                loading,
                messages: messages.reduce((accumulator, message) => {
                    accumulator[message.key] = message.text;
                    return accumulator;
                }, transformedMessages),
            };
        },
    },
);

export default compose(
    withApolloProvider(apollo), withSettings, withAppData)(App);

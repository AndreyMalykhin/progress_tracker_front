import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import App, { IAppProps } from "components/app";
import Error from "components/error";
import Loader from "components/loader";
import withError from "components/with-error";
import withLoader from "components/with-loader";
import gql from "graphql-tag";
import { History } from "history";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import getDataOrQueryStatus from "utils/get-data-or-query-status";
import { isLoading } from "utils/query-status";
import QueryStatus from "utils/query-status";

interface IAppContainerProps extends IOwnProps {
    messages: { [id: string]: string };
    history: History;
}

interface IOwnProps {
    locale: string;
}

interface IGetDataResponse {
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

const getSettingsQuery = gql`
query GetSettings {
    settings @client {
        id
        locale
    }
}`;

const getDataQuery = gql`
query GetData($locale: String!) {
    getMessages(locale: $locale) @client {
        id
        key
        text
    }
}`;

const withSettings = graphql<IGetSettingsResponse, IOwnProps, IAppProps>(
    getSettingsQuery,
    {
        props: ({ data }) => {
            return {
                locale: data!.settings.locale,
            };
        },
    },
);

const withData = graphql<IGetDataResponse, IOwnProps, IAppProps>(
    getDataQuery,
    {
        options: ({ locale }) => {
            return {
                notifyOnNetworkStatusChange: true,
                variables: { locale },
            };
        },
        props: ({ data }) => {
            const { networkStatus: queryStatus, error, getMessages } = data!;

            if (queryStatus === QueryStatus.InitialLoading) {
                return { queryStatus };
            } else if (queryStatus === QueryStatus.Error || error) {
                return { queryStatus: QueryStatus.Error };
            }

            const messages: { [key: string]: string } = {};

            for (const message of getMessages) {
                messages[message.key] = message.text;
            }

            return { messages, queryStatus };
        },
    },
);

class AppContainer extends React.Component<IAppContainerProps> {
    public render() {
        const { locale, messages, history } = this.props;
        return <App history={history} locale={locale} messages={messages} />;
    }
}

export default compose(
    withSettings,
    withData,
    withLoader(Loader),
    withError(Error),
)(AppContainer);

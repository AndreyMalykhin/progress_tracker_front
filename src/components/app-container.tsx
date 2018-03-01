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
import { compose, QueryProps } from "react-apollo";
import graphql from "react-apollo/graphql";
import { MessageValue } from "react-intl";
import getDataOrQueryStatus from "utils/get-data-or-query-status";
import makeLog from "utils/make-log";
import { isLoading } from "utils/query-status";
import QueryStatus from "utils/query-status";

interface IAppContainerProps extends IOwnProps {
    data: QueryProps & IGetDataResponse;
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
        locale: string;
    };
}

const log = makeLog("app-container");

const getSettingsQuery = gql`
query GetSettings {
    settings @client {
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
        options: { fetchPolicy: "cache-only" },
        props: ({ data }) => {
            return { locale: data!.settings.locale };
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
    },
);

class AppContainer extends React.Component<IAppContainerProps> {
    private messages: { [id: string]: string } = {};

    public render() {
        const { locale, history } = this.props;
        return (
            <App
                history={history}
                locale={locale}
                messages={this.messages}
            />
        );
    }

    public componentWillMount() {
        log.trace("componentWillMount()");
        this.initMessages(this.props);
    }

    public componentWillReceiveProps(nextProps: IAppContainerProps) {
        if (this.props.locale !== nextProps.locale) {
            this.initMessages(nextProps);
        }
    }

    private initMessages(props: IAppContainerProps) {
        this.messages = {};

        for (const message of props.data.getMessages) {
            this.messages[message.key] = message.text;
        }
    }
}

export default compose(
    withSettings,
    withData,
    withLoader<IAppContainerProps, IGetDataResponse>(Loader, {
        dataField: "getMessages",
        getQuery: (props) => props.data,
        showIfNoQuery: false,
    }),
)(AppContainer);

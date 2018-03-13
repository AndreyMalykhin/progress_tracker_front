import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import App, { IAppProps } from "components/app";
import Error from "components/error";
import Loader from "components/loader";
import withLoader from "components/with-loader";
import gql from "graphql-tag";
import { History } from "history";
import * as React from "react";
import { compose, QueryProps } from "react-apollo";
import graphql from "react-apollo/graphql";
import { MessageValue } from "react-intl";
import SplashScreen from "react-native-splash-screen";
import makeLog from "utils/make-log";
import { isLoading } from "utils/query-status";
import QueryStatus from "utils/query-status";

interface IAppContainerProps extends IOwnProps {
    locale: string;
}

interface IOwnProps {
    history: History;
    messages: { [locale: string]: { [id: string]: string } };
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

const withSettings = graphql<
    IGetSettingsResponse, IOwnProps, IAppContainerProps
>(
    getSettingsQuery,
    {
        options: { fetchPolicy: "cache-only" },
        props: ({ data }) => {
            return { locale: data!.settings.locale };
        },
    },
);

class AppContainer extends React.Component<IAppContainerProps> {
    private messages: { [id: string]: string } = {};

    public render() {
        const { locale, history, messages } = this.props;
        return (
            <App
                history={history}
                locale={locale}
                messages={messages[locale]}
            />
        );
    }

    public componentWillMount() {
        log.trace("componentWillMount()");
    }

    public componentDidMount() {
        SplashScreen.hide();
    }
}

export default withSettings(AppContainer);

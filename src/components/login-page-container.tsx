import { skipLogin } from "actions/skip-login-action";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import LoginPage, { ILoginPageProps } from "components/login-page";
import withDIContainer from "components/with-di-container";
import withLoginAction, {
    IWithLoginActionProps,
} from "components/with-login-action";
import gql from "graphql-tag";
import * as React from "react";
import { compose, withApollo } from "react-apollo";
import graphql from "react-apollo/graphql";
import { MutationFunc } from "react-apollo/types";
import { IWithApolloProps } from "utils/interfaces";

interface ILoginPageContainerProps extends IWithApolloProps {
    onSkip: () => void;
}

class LoginPageContainer extends React.Component<ILoginPageContainerProps> {
    public render() {
        return (
            <LoginPage onSkip={this.onSkip} />
        );
    }

    private onSkip = () => skipLogin(this.props.client);
}

export default compose(withDIContainer, withApollo)(LoginPageContainer);

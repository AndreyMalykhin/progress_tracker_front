import {
    completeIntro,
    completeIntroQuery,
    ICompleteIntroResponse,
} from "actions/complete-intro-action";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import IntroPage, { IIntroPageProps } from "components/intro-page";
import withLoginAction, {
    IWithLoginActionProps,
} from "components/with-login-action";
import gql from "graphql-tag";
import * as React from "react";
import { compose, withApollo } from "react-apollo";
import graphql from "react-apollo/graphql";
import { MutationFunc } from "react-apollo/types";
import { IWithApolloProps } from "utils/interfaces";

interface IIntroPageContainerProps extends
    IWithApolloProps, IWithLoginActionProps {
    onClose: () => void;
}

const withCompleteIntro = graphql<ICompleteIntroResponse, {}, IIntroPageProps>(
    completeIntroQuery,
    {
        props: ({ mutate }) => {
            return {
                onClose: () => completeIntro(mutate!),
            };
        },
    },
);

class IntroPageContainer extends React.Component<IIntroPageContainerProps> {
    public render() {
        return (
            <IntroPage onClose={this.props.onClose} onLogin={this.onLogin} />
        );
    }

    private onLogin = async () => {
        const isSuccess = await this.props.onLogin();

        if (!isSuccess) {
            return false;
        }

        this.props.onClose();
        return true;
    }
}

export default compose(withCompleteIntro, withLoginAction)(IntroPageContainer);

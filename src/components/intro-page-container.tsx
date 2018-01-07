import {
    completeIntro,
    completeIntroQuery,
    ICompleteIntroResponse,
} from "actions/complete-intro-action";
import { ILoginResponse, login, loginQuery } from "actions/login-action";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import IntroPage, { IIntroPageProps } from "components/intro-page";
import gql from "graphql-tag";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { MutationFunc } from "react-apollo/types";

const withLogin = graphql<ILoginResponse, {}, IIntroPageProps>(
    loginQuery,
    {
        name: "loginMutation",
        props: ({ loginMutation }: any) => {
            return {
                onLogin: () =>
                    login(loginMutation as MutationFunc<ILoginResponse>),
            };
        },
    },
);

const withCompleteIntro = graphql<ICompleteIntroResponse, {}, IIntroPageProps>(
    completeIntroQuery,
    {
        name: "completeIntroMutation",
        props: ({ completeIntroMutation }: any) => {
            return {
                onClose: () => completeIntro(
                    completeIntroMutation as MutationFunc<ICompleteIntroResponse>),
            };
        },
    },
);

export default compose(withCompleteIntro, withLogin)(IntroPage);

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
        props: ({ mutate }) => {
            return {
                onLogin: () => login(mutate!),
            };
        },
    },
);

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

export default compose(withCompleteIntro, withLogin)(IntroPage);

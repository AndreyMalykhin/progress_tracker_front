import {
    completeIntro,
    completeIntroQuery,
    ICompleteIntroResponse,
} from "actions/complete-intro-action";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import IntroPage, { IIntroPageProps } from "components/intro-page";
import withLoginAction from "components/with-login-action";
import gql from "graphql-tag";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { MutationFunc } from "react-apollo/types";

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

export default compose(withCompleteIntro, withLoginAction)(IntroPage);

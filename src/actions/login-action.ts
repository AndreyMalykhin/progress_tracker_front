import { setSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import { AccessToken, LoginManager, LoginResult } from "react-native-fbsdk";
import { Sentry } from "react-native-sentry";
import AnalyticsEvent from "utils/analytics-event";
import dataIdFromObject from "utils/data-id-from-object";
import makeLog from "utils/make-log";

interface ILoginResponse {
    login: {
        user: {
            id: string;
        };
        accessToken: string;
        isNewUser: boolean;
    };
}

const log = makeLog("login-action");

const loginQuery = gql`
mutation LoginMutation($facebookAccessToken: String!) {
    login(facebookAccessToken: $facebookAccessToken) {
        user {
            id
            avatarUrlMedium
            avatarUrlSmall
            isReported
            name
            rating
            rewardableReviewsLeft
        }
        accessToken
        isNewUser
    }
}`;

async function login(
    apollo: ApolloClient<NormalizedCacheObject>,
    isRefreshingAccessToken?: boolean,
) {
    let result: LoginResult;
    LoginManager.logOut();

    try {
        result = await LoginManager.logInWithReadPermissions(
            ["public_profile"]);
    } catch (e) {
        log.error("login", e);
        throw e;
    }

    if (result.isCancelled) {
        return false;
    }

    const facebookAccessToken = await AccessToken.getCurrentAccessToken();
    const response = await apollo.mutate({
        fetchPolicy: "no-cache",
        mutation: loginQuery,
        variables: { facebookAccessToken: facebookAccessToken!.accessToken },
    });
    const { user, accessToken, isNewUser } = response!.data!.login;
    Sentry.setUserContext({ id: user.id });

    if (!isNewUser && !isRefreshingAccessToken) {
        try {
            await apollo.resetStore();
        } catch (e) {
            log.error("login", e);
            throw e;
        }
    }

    apollo.writeData({ data: response.data });
    setSession(user.id, accessToken, apollo);
    return true;
}

export { login, loginQuery, ILoginResponse };

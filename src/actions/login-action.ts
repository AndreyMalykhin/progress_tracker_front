import { setSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import { AccessToken, LoginManager, LoginResult } from "react-native-fbsdk";
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
    mutate: MutationFunc<ILoginResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    let result: LoginResult;
    LoginManager.logOut();

    try {
        result = await LoginManager.logInWithReadPermissions(
            ["public_profile"]);
    } catch (e) {
        log.error("login(); facebook error=%o", e);
        throw e;
    }

    if (result.isCancelled) {
        return false;
    }

    const facebookAccessToken = await AccessToken.getCurrentAccessToken();
    const response = await mutate({
        variables: { facebookAccessToken: facebookAccessToken!.accessToken },
    });
    const { user, accessToken, isNewUser } = response.data.login;

    if (!isNewUser) {
        try {
            await apollo.resetStore();
        } catch (e) {
            log.error("login(); reset store error=%o", e);
            throw e;
        }
    }

    apollo.writeData({ data: response.data });
    setSession(user.id, accessToken, apollo);
    return true;
}

export { login, loginQuery, ILoginResponse };

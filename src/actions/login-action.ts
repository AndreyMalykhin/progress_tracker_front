import { setSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
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
    }
}`;

async function login(mutate: MutationFunc<ILoginResponse>) {
    let result: LoginResult;
    LoginManager.logOut();

    try {
        result = await LoginManager.logInWithReadPermissions(
            ["public_profile"]);
    } catch (e) {
        log.error("login(); error=%o", e);
        throw e;
    }

    if (result.isCancelled) {
        return false;
    }

    const facebookAccessToken = await AccessToken.getCurrentAccessToken();
    await mutate({
        update: (proxy, response) => {
            updateSession(response.data as ILoginResponse, proxy);
        },
        variables: { facebookAccessToken: facebookAccessToken!.accessToken },
    });
    return true;
}

function updateSession(response: ILoginResponse, apollo: DataProxy) {
    const { user, accessToken } = response.login;
    setSession(user.id, accessToken, apollo);
}

export { login, loginQuery, ILoginResponse };

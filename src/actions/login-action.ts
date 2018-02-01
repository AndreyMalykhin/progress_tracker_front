import gql from "graphql-tag";
import { MutationFunc } from "react-apollo/types";
import { AccessToken, LoginManager, LoginResult } from "react-native-fbsdk";

interface ILoginResponse {
    login: {
        user: {
            id: string;
            accessToken: string;
        };
    };
    completeIntro: {
        settings: {
            id: string;
            showIntro: boolean;
        };
    };
}

const loginQuery = gql`
mutation LoginMutation($facebookAccessToken: String!) {
    login(facebookAccessToken: $facebookAccessToken) {
        user {
            id
            accessToken
        }
    }
    completeIntro @client {
        settings {
            id
            showIntro
        }
    }
}`;

async function login(mutate: MutationFunc<ILoginResponse>) {
    let result: LoginResult;

    try {
        result = await LoginManager.logInWithReadPermissions(
            ["public_profile"]);
    } catch (e) {
        // TODO
        throw e;
    }

    if (result.isCancelled) {
        return false;
    }

    const accessToken = await AccessToken.getCurrentAccessToken();
    await mutate({
        variables: { facebookAccessToken: accessToken!.accessToken },
    });
    return true;
}

export { login, loginQuery, ILoginResponse };

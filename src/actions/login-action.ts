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
}

async function login(mutation: MutationFunc<ILoginResponse>) {
    let result: LoginResult;

    try {
        result = await LoginManager.logInWithReadPermissions(["public_profile"]);
    } catch (e) {
        // TODO
        throw e;
    }

    if (result.isCancelled) {
        return false;
    }

    const accessToken = await AccessToken.getCurrentAccessToken();
    mutation({
        variables: { facebookAccessToken: accessToken!.accessToken },
    });
    return true;
}

const loginQuery = gql`
mutation LoginMutation($facebookAccessToken: String!) {
    login(facebookAccessToken: $facebookAccessToken) {
        user {
            id
            accessToken
        }
    }
    completeIntro @client
}`;

export { login, ILoginResponse, loginQuery };

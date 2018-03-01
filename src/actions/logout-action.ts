import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { LoginManager } from "react-native-fbsdk";
import makeLog from "utils/make-log";

const log = makeLog("logout-action");

async function logout(apollo: ApolloClient<NormalizedCacheObject>) {
    log.trace("logout()");
    LoginManager.logOut();

    try {
        await apollo.resetStore();
    } catch (e) {
        log.error("logout(); reset store error=%o", e);
        throw e;
    }
}

export { logout };

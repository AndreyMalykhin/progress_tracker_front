import { setSession } from "actions/session-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { History } from "history";
import { LoginManager } from "react-native-fbsdk";
import makeLog from "utils/make-log";
import { IMultiStackHistoryState } from "utils/multi-stack-history";
import routes from "utils/routes";

const log = makeLog("logout-action");

async function logout(
    history: History, apollo: ApolloClient<NormalizedCacheObject>,
) {
    log.trace("logout()");
    LoginManager.logOut();
    const userId = null;
    const accessToken = null;
    setSession(userId, accessToken, apollo);
    const state: IMultiStackHistoryState = {
        multiStackHistory: { reset: true },
    };
    history.replace({ pathname: routes.index.path, state });

    try {
        await apollo.resetStore();
    } catch (e) {
        log.error("logout(); reset store error=%o", e);
        throw e;
    }
}

export { logout };

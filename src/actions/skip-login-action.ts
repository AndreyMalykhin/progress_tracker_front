import { setSession } from "actions/session-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import defaultId from "utils/default-id";
import makeLog from "utils/make-log";

const log = makeLog("skip-login-action");

function skipLogin(apollo: ApolloClient<NormalizedCacheObject>) {
    log.trace("skipLogin()");
    const userId = defaultId;
    const accessToken = null;
    setSession(userId, accessToken, apollo);
}

export { skipLogin };

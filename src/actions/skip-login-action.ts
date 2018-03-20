import { initActiveTrackables } from "actions/active-trackables-helpers";
import { initActivities } from "actions/activity-helpers";
import { initArchivedTrackables } from "actions/archived-trackables-helpers";
import {
    initPendingReviewTrackables,
} from "actions/pending-review-trackables-helpers";
import { setSession } from "actions/session-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import Type from "models/type";
import { Sentry } from "react-native-sentry";
import defaultId from "utils/default-id";
import makeLog from "utils/make-log";

const log = makeLog("skip-login-action");

function skipLogin(apollo: ApolloClient<NormalizedCacheObject>) {
    log.trace("skipLogin");
    const userId = defaultId;
    const accessToken = null;
    Sentry.setUserContext({ id: userId });
    setSession(userId, accessToken, apollo);
}

export { skipLogin };

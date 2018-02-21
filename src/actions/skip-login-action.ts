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
import defaultId from "utils/default-id";
import makeLog from "utils/make-log";

const log = makeLog("skip-login-action");

function skipLogin(apollo: ApolloClient<NormalizedCacheObject>) {
    log.trace("skipLogin()");
    initData(apollo);
    const userId = defaultId;
    const accessToken = null;
    setSession(userId, accessToken, apollo);
}

function initData(apollo: ApolloClient<NormalizedCacheObject>) {
    initActiveTrackables(apollo);
    initArchivedTrackables(apollo);
    initPendingReviewTrackables(apollo);
    initActivities(apollo);
}

export { skipLogin };

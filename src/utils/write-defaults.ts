import { initActiveTrackables } from "actions/active-trackables-helpers";
import { initActivities } from "actions/activity-helpers";
import { initArchivedTrackables } from "actions/archived-trackables-helpers";
import {
    initPendingReviewTrackables,
} from "actions/pending-review-trackables-helpers";
import { DataProxy } from "apollo-cache";
import makeLog from "utils/make-log";

const log = makeLog("write-defaults");

function writeDefaults(
    persistentData: any, nonPersistentData: any, cache: DataProxy,
) {
    log.trace("writeDefaults");

    if (persistentData) {
        cache.writeData({ data: persistentData });
    }

    writeNonPersistentDefaults(nonPersistentData, cache);
    initActiveTrackables(cache);
    initArchivedTrackables(cache);
    initPendingReviewTrackables(cache);
    initActivities(cache);
}

function writeNonPersistentDefaults(data: any, cache: DataProxy) {
    log.trace("writeNonPersistentDefaults");

    if (data) {
        cache.writeData({ data });
    }
}

export { writeDefaults, writeNonPersistentDefaults };

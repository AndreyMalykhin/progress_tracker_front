import { addGenericErrorToast } from "actions/toast-helpers";
import { DataProxy } from "apollo-cache";
import { onError } from "apollo-link-error";
import AudioManager from "utils/audio-manager";
import makeLog from "utils/make-log";

interface IContext {
    isOfflineOperation?: boolean;
    cache: DataProxy;
}

const log = makeLog("error-link");

function makeErrorLink() {
    return onError((error) => {
        // TODO send to analytics

        log.error("error=%o", error);
        const { cache, isOfflineOperation } =
            error.operation.getContext() as IContext;

        if (!isOfflineOperation) {
            addGenericErrorToast(cache);
        }
    });
}

export { makeErrorLink };

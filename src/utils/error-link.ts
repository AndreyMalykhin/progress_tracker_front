import { addGenericErrorToast } from "actions/toast-helpers";
import { DataProxy } from "apollo-cache";
import { onError } from "apollo-link-error";
import makeLog from "utils/make-log";

interface IContext {
    isOfflineOperation?: boolean;
    cache: DataProxy;
}

const log = makeLog("error-link");

const ErrorLink = onError((error) => {
    // TODO
    log.error("error=%o", error);
    const { cache, isOfflineOperation } =
        error.operation.getContext() as IContext;

    if (!isOfflineOperation) {
        addGenericErrorToast(cache);
    }
});

export default ErrorLink;

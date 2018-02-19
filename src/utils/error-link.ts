import { addGenericErrorToast } from "actions/toast-helpers";
import { DataProxy } from "apollo-cache";
import { onError } from "apollo-link-error";
import makeLog from "./make-log";

const log = makeLog("error-link");

const ErrorLink = onError((error) => {
    // TODO
    log.error("error=%o", error);
    const apollo = error.operation.getContext().cache as DataProxy;
    addGenericErrorToast(apollo);
});

export default ErrorLink;

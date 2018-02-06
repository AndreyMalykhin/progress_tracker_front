import * as debug from "debug";

function makeLog(namespace: string) {
    return debug("progress-tracker:" + namespace);
}

export default makeLog;

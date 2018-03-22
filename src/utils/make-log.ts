import * as debug from "debug";
import { Sentry } from "react-native-sentry";

class Log {
    private namespace: string;
    private debugger: debug.IDebugger;

    public constructor(namespace: string) {
        this.namespace = namespace;
        this.debugger = debug("progress-tracker:" + namespace);
    }

    public trace(funcName: string, formatter?: string, ...args: any[]) {
        this.debugger(`${funcName}() ${formatter || ""}`, ...args);
    }

    public error(funcName: string, e: Error | string, info?: object) {
        this.trace(funcName, "error=%o; info=%o", e, info);
        const options = {
            culprit: `${this.namespace}.${funcName}`, extra: info,
        };

        if (typeof e === "string") {
            Sentry.captureMessage(e, options);
            return;
        }

        Sentry.captureException(e, options);
    }
}

function makeLog(namespace: string) {
    return new Log(namespace);
}

export { Log };
export default makeLog;

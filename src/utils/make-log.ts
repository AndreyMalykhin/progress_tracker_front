import * as debug from "debug";

class Log {
    private debugger: debug.IDebugger;

    public constructor(namespace: string) {
        this.debugger = debug("progress-tracker:" + namespace);
    }

    public trace(...args: any[]) {
        this.debugger(args);
    }

    public error(...args: any[]) {
        // TODO
        this.trace(...args);
    }
}

function makeLog(namespace: string) {
    return new Log(namespace);
}

export default makeLog;

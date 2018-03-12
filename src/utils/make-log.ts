import * as debug from "debug";

class Log {
    private debugger: debug.IDebugger;

    public constructor(namespace: string) {
        this.debugger = debug("progress-tracker:" + namespace);
    }

    public trace(formatter: any, ...args: any[]) {
        this.debugger(formatter, ...args);
    }

    public error(formatter: any, ...args: any[]) {
        // TODO send to analytics
        this.trace(formatter, ...args);
    }
}

function makeLog(namespace: string) {
    return new Log(namespace);
}

export default makeLog;

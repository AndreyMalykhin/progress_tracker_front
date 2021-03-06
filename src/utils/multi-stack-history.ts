import {
    createMemoryHistory,
    History,
    LocationDescriptorObject,
    LocationListener,
    LocationState,
    Path,
    TransitionPromptHook,
} from "history";
import makeLog from "utils/make-log";

interface IMultiStackHistoryState {
    multiStackHistory: {
        reset?: boolean;
    };
}

type IChange = () => void;

const log = makeLog("multi-stack-history");

class MultiStackHistory implements History {
    private impl: History;
    private size = 1;
    private changeQueue: IChange[] = [];

    public constructor() {
        this.impl = createMemoryHistory();
        this.impl.listen(this.onChange);
    }

    public get length() {
        return this.size;
    }

    public get action() {
        return this.impl.action;
    }

    public get location() {
        return this.impl.location;
    }

    public push(location: LocationDescriptorObject): void;
    public push(path: Path, state?: LocationState): void;
    public push(
        pathOrLocation: Path | LocationDescriptorObject, state?: LocationState,
    ) {
        log.trace("push", "location=%o", pathOrLocation);
        this.queueChange(() => ++this.size);
        return typeof pathOrLocation === "string" ?
            this.impl.push(pathOrLocation, state) :
            this.impl.push(pathOrLocation);
    }

    public replace(path: Path, state?: LocationState): void;
    public replace(location: LocationDescriptorObject): void;
    public replace(
        pathOrLocation: LocationDescriptorObject | Path, state?: LocationState,
    ) {
        log.trace("replace", "location=%o", pathOrLocation);
        const newState: IMultiStackHistoryState =
            state || (pathOrLocation as LocationDescriptorObject).state;

        if (newState
            && newState.multiStackHistory
            && newState.multiStackHistory.reset
        ) {
            newState.multiStackHistory.reset = undefined;
            this.queueChange(() => this.size = 1);
        }

        return typeof pathOrLocation === "string" ?
            this.impl.replace(pathOrLocation, newState) :
            this.impl.replace(pathOrLocation);
    }

    public go(n: number) {
        if (n > 0) {
            log.trace("go", "not supported with n=%o", n);
            return;
        }

        this.queueChange(() => this.size += n);
        return this.impl.go(n);
    }

    public goBack() {
        log.trace("goBack");
        return this.go(-1);
    }

    public goForward() {
        return this.go(1);
    }

    public block(prompt?: boolean | string | TransitionPromptHook) {
        return this.impl.block(prompt);
    }

    public listen(listener: LocationListener) {
        return this.impl.listen(listener);
    }

    public createHref(location: LocationDescriptorObject) {
        return this.impl.createHref(location);
    }

    private onChange: LocationListener = (location, action) => {
        const change = this.changeQueue.pop();

        if (change) {
            change();
            log.trace("onChange", "size=%o", this.size);
        }
    }

    private queueChange(change: IChange) {
        this.changeQueue.push(change);
    }
}

export { IMultiStackHistoryState };
export default MultiStackHistory;

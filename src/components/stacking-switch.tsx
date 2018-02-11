import { Location } from "history";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
    match as Match,
    matchPath,
    RouteComponentProps,
    RouteProps,
    Switch,
    withRouter,
} from "react-router";
import makeLog from "utils/make-log";

const log = makeLog("stacking-switch");

type IChildren = Array< React.ReactElement<RouteProps> >;

interface IStackEntry {
    children: IChildren;
    location: Location;
}

interface IStackingSwitchProps extends RouteComponentProps<{}> {
    children: IChildren;
}

class StackingSwitch extends React.Component<IStackingSwitchProps> {
    private stack: IStackEntry[] = [];
    private shouldPop: boolean[] = [];

    public render() {
        const lastEntryIndex = this.stack.length - 1;
        const stackElements = this.stack.map((entry, i) => {
            const style =
                i === lastEntryIndex ? styles.child : styles.childHidden;
            return (
                <View key={i} style={style}>
                    <Switch location={entry.location}>{entry.children}</Switch>
                </View>
            );
        });
        return <View style={styles.container}>{stackElements}</View>;
    }

    public componentWillMount() {
        const { location, children } = this.props;
        this.stack.push({ location, children });
        this.shouldPop.push(true);
    }

    public componentWillReceiveProps(nextProps: IStackingSwitchProps) {
        const prevLocation = this.props.location;
        const nextLocation = nextProps.location;

        if (this.props.history.action === nextProps.history.action
            && prevLocation.hash === nextLocation.hash
            && prevLocation.key === nextLocation.key
            && prevLocation.pathname === nextLocation.pathname
            && prevLocation.search === nextLocation.search
            && prevLocation.state === nextLocation.state
        ) {
            return;
        }

        this.updateStack(nextProps);
    }

    private updateStack(props: IStackingSwitchProps) {
        const { children, location, history, match } = props;
        const { action } = history;

        switch (action) {
            case "PUSH":
            if (this.isLocationPathChanged(this.props.location, location)
                && this.isSomeChildMatches(children, location)
            ) {
                this.stack.push({ children, location });
                this.shouldPop.push(true);
                log("updateStack(); push; stackSize=%o", this.stack.length);
            } else {
                this.replaceTop(children, location);
                this.shouldPop.push(false);
            }

            break;
            case "POP":
            if (location.pathname !== "/" && this.shouldPop.pop()) {
                this.stack.pop();
                log("updateStack(); pop; stackSize=%o", this.stack.length);
            } else {
                this.replaceTop(children, location);
            }

            break;
            case "REPLACE":
            if (history.length === 1) {
                this.stack.length = 1;
                this.shouldPop.length = 1;
            }

            this.replaceTop(children, location);
            break;
            default:
            throw new Error("Unexpected action: " + action);
        }
    }

    private replaceTop(children: IChildren, location: Location) {
        log("replaceTop(); stackSize=%o; location=%o", this.stack.length,
            location);
        const topEntry = this.stack[this.stack.length - 1];
        topEntry.children = children;
        topEntry.location = location;
    }

    private isSomeChildMatches(children: IChildren, location: Location) {
        let match: Match<any>|null;
        React.Children.forEach(children, (child) => {
            const route = child as React.ReactElement<RouteProps>;

            if (match || route.props.exact == null) {
                return;
            }

            match = matchPath(location.pathname, route.props);
        });
        return match! != null;
    }

    private isLocationPathChanged(
        prevLocation: Location, nextLocation: Location,
    ) {
        return prevLocation.pathname !== nextLocation.pathname
            || prevLocation.hash !== nextLocation.hash
            || prevLocation.search !== nextLocation.search;
    }
}

const styles = StyleSheet.create({
    child: {
        flex: 1,
    },
    childHidden: {
        display: "none",
    },
    container: {
        flex: 1,
    },
});

const childHiddenStyle = [styles.child, styles.childHidden];

export default withRouter(StackingSwitch);

import AnimatableView from "components/animatable-view";
import { Color } from "components/common-styles";
import { History, Location } from "history";
import * as PropTypes from "prop-types";
import * as React from "react";
import { LayoutAnimation, StyleSheet, View } from "react-native";
import * as Animatable from "react-native-animatable";
import {
    match as Match,
    matchPath,
    RouteComponentProps,
    RouteProps,
    Switch,
    withRouter,
} from "react-router";
import { pop, push } from "utils/immutable-utils";
import makeLog from "utils/make-log";

interface IStackingSwitchProps extends RouteComponentProps<{}> {
    children: IChildren;
}

interface IStackingSwitchState {
    stack: IStackEntry[];
}

interface IStackingSwitchHistoryState {
    stackingSwitch: {
        animation?: StackingSwitchAnimation;
    };
}

interface IStackEntryProps {
    isHidden?: boolean;
    onRef?: (ref?: Animatable.View) => void;
    children: IChildren;
    location: Location;
}

type IChildren = Array< React.ReactElement<RouteProps> >;

interface IStackEntry {
    enterAnimation?: Animatable.Animation;
    exitAnimation?: Animatable.Animation;
    ref?: Animatable.View;
    children: IChildren;
    location: Location;
    onRef?: (ref?: Animatable.View) => void;
}

interface IStackingSwitchContext {
    isInBackground: () => boolean;
}

enum StackingSwitchAnimation {
    SlideInRight = "SlideInRight",
    SlideInUp = "SlideInUp",
    FadeIn = "FadeIn",
}

const log = makeLog("stacking-switch");

const stackingSwitchAnimationDuration = 256;

class StackingSwitch extends
    React.Component<IStackingSwitchProps, IStackingSwitchState> {
    public state: IStackingSwitchState = { stack: [] };
    private shouldPop: boolean[] = [];
    private transition?: Promise<any>;

    public render() {
        const { stack } = this.state;
        const lastEntryIndex = stack.length - 1;
        const stackElements = stack.map((entry, i) => {
            return (
                <StackEntry
                    key={i}
                    isHidden={i !== lastEntryIndex}
                    location={entry.location}
                    onRef={entry.onRef}
                >
                    {entry.children}
                </StackEntry>
            );
        });
        return <View style={styles.container}>{stackElements}</View>;
    }

    public componentWillMount() {
        const { location, children } = this.props;
        this.shouldPop.push(true);
        const stack = [{ children, location }];
        this.setState({ stack });
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

        this.updateStack(nextProps, this.props);
    }

    private updateStack(
        nextProps: IStackingSwitchProps, prevProps: IStackingSwitchProps,
    ) {
        const { children, location, history, match } = nextProps;
        const { action } = history;
        const { stack } = this.state;
        let newStack;

        switch (action) {
            case "PUSH":
            newStack = this.pushLocation(
                location, prevProps.location, stack, children);
            break;
            case "POP":
            newStack = this.popLocation(location, stack, children);
            break;
            case "REPLACE":
            newStack = this.replaceLocation(location, stack, children, history);
            break;
            default:
            throw new Error("Unexpected action: " + action);
        }

        if (newStack) {
            this.setState({ stack: newStack });
        }
    }

    private replaceLocation(
        location: Location,
        stack: IStackEntry[],
        children: IChildren,
        history: History,
    ) {
        let newStack = stack;

        if (history.length === 1) {
            newStack = stack.slice(0, 1);
            this.shouldPop.length = 1;
        }

        return this.replaceTop(newStack, children, location);
    }

    private popLocation(
        location: Location, stack: IStackEntry[], children: IChildren,
    ) {
        let newStack;

        if (location.pathname !== "/" && this.shouldPop.pop()) {
            const entry = stack[stack.length - 1];
            const entryRef = entry.ref;

            if (entryRef) {
                this.transition = entryRef[entry.exitAnimation!]!().then(() => {
                    this.transition = undefined;
                    this.setState((prevState) => {
                        return { stack: pop(prevState.stack) };
                    });
                });
                return newStack;
            } else {
                newStack = pop(stack);
            }

            log.trace("popLocation(); stackSize=%o", newStack.length);
            return newStack;
        }

        return this.replaceTop(stack, children, location);
    }

    private pushLocation(
        nextLocation: Location,
        prevLocation: Location,
        stack: IStackEntry[],
        children: IChildren,
    ) {
        let newStack;

        if (this.isLocationPathChanged(prevLocation, nextLocation)
            && this.isSomeChildMatches(children, nextLocation)
        ) {
            this.shouldPop.push(true);
            const newEntryIndex = stack.length;
            const { animation } =
                (nextLocation.state as IStackingSwitchHistoryState)
                .stackingSwitch;
            const { enterAnimation, exitAnimation } =
                this.mapAnimation(animation);
            const newEntry: IStackEntry = {
                children,
                enterAnimation,
                exitAnimation,
                location: nextLocation,
                onRef: (ref) => this.onNewEntryRef(
                    newEntry, enterAnimation, ref),
            };
            newStack = push(newEntry, stack);
            log.trace("pushLocation(); stackSize=%o", newStack.length);
        } else {
            this.shouldPop.push(false);
            newStack = this.replaceTop(stack, children, nextLocation);
        }

        return newStack;
    }

    private replaceTop(
        stack: IStackEntry[], children: IChildren, location: Location,
    ) {
        const stackSize = stack.length;
        log.trace("replaceTop(); stackSize=%o; location=%o", stackSize,
            location);
        const newStack = stack.slice();
        const topEntry = stack[stackSize - 1];
        newStack[stackSize - 1] = { ...topEntry, children, location };
        return newStack;
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

    private onNewEntryRef = async (
        entry: IStackEntry,
        animation?: Animatable.Animation,
        ref?: Animatable.View,
    ) => {
        entry.ref = ref;

        if (ref && animation) {
            this.transition = ref[animation]!();
            await this.transition;
            this.transition = undefined;
        }
    }

    private mapAnimation(animation?: StackingSwitchAnimation) {
        let enterAnimation: Animatable.Animation | undefined;
        let exitAnimation: Animatable.Animation | undefined;

        switch (animation) {
            case StackingSwitchAnimation.SlideInRight:
            enterAnimation = "slideInRight";
            exitAnimation = "slideOutRight";
            break;
            case StackingSwitchAnimation.FadeIn:
            enterAnimation = "fadeIn";
            exitAnimation = "fadeOut";
            break;
            case StackingSwitchAnimation.SlideInUp:
            enterAnimation = "slideInUp";
            exitAnimation = "slideOutDown";
            break;
        }

        return { enterAnimation, exitAnimation };
    }
}

// tslint:disable-next-line:max-classes-per-file
class StackEntry extends React.Component<IStackEntryProps> {
    public static childContextTypes = {
        isInBackground: PropTypes.func.isRequired,
    };
    public static contextTypes = {
        isInBackground: PropTypes.func,
    };

    public render() {
        const { children, location, onRef } = this.props;
        return (
            <AnimatableView
                onRef={onRef as any}
                style={styles.stackEntry}
                duration={stackingSwitchAnimationDuration}
            >
                <Switch location={location}>{children}</Switch>
            </AnimatableView>
        );
    }

    public shouldComponentUpdate(nextProps: IStackEntryProps) {
        return this.props.isHidden !== nextProps.isHidden
            || !this.props.isHidden;
    }

    public getChildContext() {
        return {
            isInBackground: this.isInBackground,
        } as IStackingSwitchContext;
    }

    private isInBackground = () => {
        return (this.context.isInBackground && this.context.isInBackground())
            || this.props.isHidden;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    stackEntry: {
        ...StyleSheet.absoluteFillObject,
    },
});

export {
    IStackingSwitchContext,
    IStackingSwitchHistoryState,
    StackingSwitchAnimation,
    stackingSwitchAnimationDuration,
};
export default withRouter(StackingSwitch);

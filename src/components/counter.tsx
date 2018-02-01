import { ICommandBarItem } from "components/command-bar";
import Trackable from "components/trackable";
import ITrackableBaseProps from "components/trackable-base-props";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { LayoutRectangle, StyleSheet, Text } from "react-native";

interface ICounterProps extends ITrackableBaseProps {
    iconName: string;
    title: string;
    progress: number;
}

class Counter extends React.PureComponent<ICounterProps> {
    public render() {
        const { progress, ...restProps } = this.props;
        return (
            <Trackable {...restProps}>
                <Text style={styles.progress}>{progress}</Text>
            </Trackable>
        );
    }
}

const styles = StyleSheet.create({
    progress: {
        textAlign: "center",
    },
});

export { ICounterProps };
export default Counter;

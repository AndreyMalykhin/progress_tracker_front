import ProgressDisplayMode from "models/progress-display-mode";
import * as React from "react";
import {
    Animated,
    Easing,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import ProgressBarImpl from "react-native-progress/Bar";

interface IProgressBarProps {
    value: number;
    maxValue: number;
    mode: ProgressDisplayMode;
    style?: StyleProp<ViewStyle>;
}

interface IProgressBarState {
    isInitialRender: boolean;
}

const animationConfig = {
    duration: 2000,
    easing: Easing.out(Easing.sin),
} as Animated.TimingAnimationConfig;

class ProgressBar extends
    React.PureComponent<IProgressBarProps, IProgressBarState> {
    public state: IProgressBarState = { isInitialRender: true };

    public render() {
        const { maxValue, mode, style } = this.props;
        let value = 0;

        if (!this.state.isInitialRender) {
            value = this.props.value;
        }

        const normalizedValue = value / maxValue;
        const formattedValue = mode === ProgressDisplayMode.Percentage ?
            `${(normalizedValue * 100).toFixed(2)} %` : value;
        return (
            <View style={[styles.container, style]}>
                <ProgressBarImpl
                    animationType="timing"
                    animationConfig={animationConfig}
                    progress={normalizedValue}
                    width={null}
                    height={height}
                    color={"#0076ff"}
                    unfilledColor={"#000"}
                    borderRadius={8}
                    borderWidth={0}
                />
                <Text style={styles.value}>{formattedValue}</Text>
            </View>
        );
    }

    public componentDidMount() {
        this.setState({ isInitialRender: false });
    }
}

const height = 16;

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    value: {
        backgroundColor: "transparent",
        bottom: 0,
        color: "#fff",
        left: 0,
        lineHeight: height,
        position: "absolute",
        right: 0,
        textAlign: "center",
        top: 0,
    },
});

export { IProgressBarProps };
export default ProgressBar;

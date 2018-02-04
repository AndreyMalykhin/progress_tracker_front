import ProgressDisplayMode from "models/progress-display-mode";
import * as React from "react";
import {
    Animated,
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

const animationConfig = { duration: 1000 } as Animated.TimingAnimationConfig;

class ProgressBar extends React.PureComponent<IProgressBarProps> {
    public render() {
        const { value, maxValue, mode, style } = this.props;
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
                    borderRadius={0}
                    borderWidth={0}
                />
                <Text style={styles.value}>{formattedValue}</Text>
            </View>
        );
    }
}

const height = 16;

const styles = StyleSheet.create({
    container: {},
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

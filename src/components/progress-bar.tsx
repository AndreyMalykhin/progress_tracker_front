import ProgressDisplayMode from "models/progress-display-mode";
import * as React from "react";
import { FormattedNumber } from "react-intl";
import {
    Animated,
    Easing,
    LayoutChangeEvent,
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
    width: number;
}

const animationConfig = {
    duration: 2000,
    easing: Easing.out(Easing.sin),
} as Animated.TimingAnimationConfig;

class ProgressBar extends
    React.PureComponent<IProgressBarProps, IProgressBarState> {
    public state: IProgressBarState = { isInitialRender: true, width: 0 };

    public render() {
        const { maxValue, mode, style } = this.props;
        let value = 0;

        if (!this.state.isInitialRender) {
            value = this.props.value;
        }

        const normalizedValue = value / maxValue;
        const formattedValue = mode === ProgressDisplayMode.Percentage ? (
            <FormattedNumber
                value={normalizedValue}
                minimumFractionDigits={2}
                maximumFractionDigits={2}
                useGrouping={false}
                style="percent"
            />
        ) : value;
        return (
            <View style={[styles.container, style]} onLayout={this.onLayout}>
                <ProgressBarImpl
                    animated={true}
                    animationType="timing"
                    animationConfig={animationConfig}
                    progress={normalizedValue}
                    width={this.state.width}
                    height={height}
                    color={"#0076ff"}
                    unfilledColor={backgroundColor}
                    borderRadius={borderRadius}
                    borderWidth={0}
                    useNativeDriver={true}
                />
                <Text style={styles.value}>{formattedValue}</Text>
            </View>
        );
    }

    public componentDidMount() {
        this.setState({ isInitialRender: false });
    }

    private onLayout = (evt: LayoutChangeEvent) =>
        this.setState({ width: evt.nativeEvent.layout.width })
}

const height = 16;
const backgroundColor = "#000";
const borderRadius = 8;

const styles = StyleSheet.create({
    container: {
        backgroundColor,
        borderRadius,
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

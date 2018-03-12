import {
    BorderRadius,
    BrandColor,
    Color,
    Gap,
    ProgressBarStyle,
    ShadeColor,
    TypographyStyle,
} from "components/common-styles";
import Text from "components/text";
import { CalloutText } from "components/typography";
import ProgressDisplayMode from "models/progress-display-mode";
import * as React from "react";
import { FormattedNumber } from "react-intl";
import {
    Animated,
    Easing,
    LayoutChangeEvent,
    StyleProp,
    StyleSheet,
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
    duration: 1024,
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
                    color={ProgressBarStyle.color}
                    unfilledColor={backgroundColor}
                    borderRadius={borderRadius}
                    borderWidth={0}
                    useNativeDriver={true}
                />
                <CalloutText style={styles.value} light={true}>
                    {formattedValue}
                </CalloutText>
            </View>
        );
    }

    public componentDidMount() {
        this.setState({ isInitialRender: false });
    }

    private onLayout = (evt: LayoutChangeEvent) =>
        this.setState({ width: evt.nativeEvent.layout.width })
}

const height = TypographyStyle.calloutLight.lineHeight!;
const backgroundColor = ShadeColor.dark;
const borderRadius = BorderRadius.double;

const styles = StyleSheet.create({
    container: {
        backgroundColor,
        borderRadius,
        marginBottom: Gap.single,
    },
    value: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "transparent",
        lineHeight: height,
        textAlign: "center",
    },
});

export { IProgressBarProps };
export default ProgressBar;

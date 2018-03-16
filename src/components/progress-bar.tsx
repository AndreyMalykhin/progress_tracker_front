import AnimatedNumber, {
    numberAnimationDuration,
} from "components/animated-number";
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
import { InjectedIntlProps, injectIntl } from "react-intl";
import {
    Animated,
    Easing,
    LayoutChangeEvent,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";
import * as Animatable from "react-native-animatable";
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
    duration: numberAnimationDuration,
    easing: Easing.inOut(Easing.sin),
    isInteraction: false,
} as Animated.TimingAnimationConfig;

class ProgressBar extends React.PureComponent<
    IProgressBarProps & InjectedIntlProps, IProgressBarState
> {
    public state: IProgressBarState = { isInitialRender: true, width: 0 };

    public render() {
        const { value, maxValue, mode, style } = this.props;
        const { width, isInitialRender } = this.state;
        let displayValue = isInitialRender ? 0 : value;
        const normalizedValue = displayValue / maxValue;

        if (mode === ProgressDisplayMode.Percentage) {
            displayValue = normalizedValue;
        }

        return (
            <View
                style={[styles.container, style]}
                onLayout={this.onLayout}
            >
                <ProgressBarImpl
                    animated={true}
                    animationType="timing"
                    animationConfig={animationConfig}
                    progress={normalizedValue}
                    width={width}
                    height={height}
                    color={ProgressBarStyle.color}
                    unfilledColor={backgroundColor}
                    borderRadius={borderRadius}
                    borderWidth={0}
                    useNativeDriver={true}
                />
                <View style={styles.valueContainer}>
                    <AnimatedNumber
                        isPercentage={mode === ProgressDisplayMode.Percentage}
                        value={displayValue}
                        onRender={this.onRenderNumber}
                    />
                </View>
            </View>
        );
    }

    public componentDidMount() {
        this.setState({ isInitialRender: false });
    }

    private onRenderNumber = (value: string) => {
        return (
            <CalloutText style={styles.value} light={true}>{value}</CalloutText>
        );
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
        backgroundColor: "transparent",
        lineHeight: height,
        textAlign: "center",
    },
    valueContainer: {
        ...StyleSheet.absoluteFillObject,
    },
});

export { IProgressBarProps };
export default injectIntl(ProgressBar);

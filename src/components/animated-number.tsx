import AnimatableView from "components/animatable-view";
import { Cancelable, throttle } from "lodash";
import * as React from "react";
import { FormattedNumber, InjectedIntlProps, injectIntl } from "react-intl";
import { Animated, Easing, StyleProp, ViewStyle } from "react-native";
import * as Animatable from "react-native-animatable";
import { NumberFormat } from "utils/formats";
import makeLog from "utils/make-log";

interface IAnimatedNumberProps {
    style?: StyleProp<ViewStyle>;
    isPercentage?: boolean;
    value: number;
    onRender: (value: string) => React.ReactNode;
}

const log = makeLog("animated-number");

const numberAnimationDuration = 1024;

const percentageFormatConfig: FormattedNumber.PropsBase = {
    format: NumberFormat.Percentage,
};

const absoluteFormatConfig: FormattedNumber.PropsBase = {
    format: NumberFormat.Absolute,
};

class AnimatedNumber extends React.PureComponent<
    IAnimatedNumberProps & InjectedIntlProps
> {
    private ref?: Animatable.View;

    public render() {
        const { intl, isPercentage, style, onRender } = this.props;
        const formatConfig =
            isPercentage ? percentageFormatConfig : absoluteFormatConfig;
        return (
            <AnimatableView
                style={style}
                onRef={this.onRef as any}
                duration={numberAnimationDuration}
                direction="alternate-reverse"
            >
                {onRender(intl.formatNumber(this.props.value, formatConfig))}
            </AnimatableView>
        );
    }

    public componentWillReceiveProps(nextProps: IAnimatedNumberProps) {
        const { value: prevValue, isPercentage: prevIsPercentage } = this.props;
        const { value: nextValue, isPercentage: nextIsPercentage } = nextProps;

        if (prevValue === nextValue
            || nextValue < prevValue
            || prevIsPercentage !== nextIsPercentage
            || !this.ref
        ) {
            return;
        }

        this.ref.flipOutX!();
    }

    private onRef = (ref?: Animatable.View) => this.ref = ref;
}

export { numberAnimationDuration };
export default injectIntl(AnimatedNumber);

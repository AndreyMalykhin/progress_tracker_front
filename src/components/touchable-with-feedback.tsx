import * as React from "react";
import {
    GestureResponderEvent,
    Platform,
    TouchableNativeFeedback,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TouchableWithoutFeedbackProperties,
} from "react-native";

interface ITouchableWithFeedbackProps extends
    TouchableWithoutFeedbackProperties {
    isAnimationDisabled?: boolean;
}

class TouchableWithFeedback extends
    React.Component<ITouchableWithFeedbackProps> {
    public render() {
        const { isAnimationDisabled, children, onPress, ...restProps } =
            this.props;
        let Component;

        if (isAnimationDisabled) {
            Component = TouchableWithoutFeedback;
        } else if (Platform.OS === "android") {
            Component = TouchableNativeFeedback;
        } else {
            Component = TouchableOpacity;
        }

        return (
            <Component onPress={onPress && this.onPress} {...restProps}>
                {children}
            </Component>
        );
    }

    private onPress = (e: GestureResponderEvent) => {
        requestAnimationFrame(() => {
            if (this.props.onPress) {
                this.props.onPress(e);
            }
        });
    }
}

export { ITouchableWithFeedbackProps };
export default TouchableWithFeedback;

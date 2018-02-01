import * as React from "react";
import {
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
        const { isAnimationDisabled, children, ...restProps } = this.props;
        let Component;

        if (isAnimationDisabled) {
            Component = TouchableWithoutFeedback;
        } else if (Platform.OS === "android") {
            Component = TouchableNativeFeedback;
        } else {
            Component = TouchableOpacity;
        }

        return <Component {...restProps}>{children}</Component>;
    }
}

export { ITouchableWithFeedbackProps };
export default TouchableWithFeedback;

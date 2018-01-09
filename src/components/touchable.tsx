import * as React from "react";
import {
    Platform,
    TouchableNativeFeedback,
    TouchableOpacity,
    TouchableWithoutFeedbackProperties,
} from "react-native";

type ITouchableProps = TouchableWithoutFeedbackProperties;

class Touchable extends React.Component<ITouchableProps> {
    public render() {
        const { children, ...restProps } = this.props;
        const Component = Platform.OS === "android" ? TouchableNativeFeedback
            : TouchableOpacity;
        return <Component {...restProps}>{children}</Component>;
    }
}

export { ITouchableProps };
export default Touchable;

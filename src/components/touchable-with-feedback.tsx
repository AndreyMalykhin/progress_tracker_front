import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import * as React from "react";
import {
    GestureResponderEvent,
    Platform,
    TouchableNativeFeedback,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TouchableWithoutFeedbackProperties,
} from "react-native";
import Sound from "utils/sound";

interface ITouchableWithFeedbackProps extends
    TouchableWithoutFeedbackProperties {
    isAnimationDisabled?: boolean;
    sound?: Sound;
}

class TouchableWithFeedback extends
    React.Component<ITouchableWithFeedbackProps & IWithDIContainerProps> {
    public static defaultProps: ITouchableWithFeedbackProps =
        { sound: Sound.Click };

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
        const { onPress, sound, diContainer } = this.props;

        if (onPress && sound) {
            diContainer.audioManager.play(sound);
        }

        requestAnimationFrame(() => {
            if (this.props.onPress) {
                this.props.onPress(e);
            }
        });
    }
}

export { ITouchableWithFeedbackProps };
export default withDIContainer(TouchableWithFeedback);

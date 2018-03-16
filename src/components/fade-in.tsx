import AnimatableView from "components/animatable-view";
import * as React from "react";
import { StyleProp, ViewProperties, ViewStyle } from "react-native";

interface IFadeInProps {
    style?: StyleProp<ViewStyle>;
}

class FadeIn extends React.Component<IFadeInProps> {
    public render() {
        const { style, children } = this.props;
        return (
            <AnimatableView
                duration={512}
                animation="fadeIn"
                style={style}
            >
                {children}
            </AnimatableView>
        );
    }
}

export default FadeIn;

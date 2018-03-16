import * as React from "react";
import { ViewProperties } from "react-native";
import * as Animatable from "react-native-animatable";

interface IAnimatableViewProps extends
    ViewProperties, Animatable.AnimatableProperties<{}> {
    onRef?: (ref?: Animatable.View) => void;
}

class AnimatableView extends React.Component<IAnimatableViewProps> {
    public render() {
        const { onRef, ...restProps } = this.props;
        return (
            <Animatable.View
                useNativeDriver={true}
                easing="ease-in-out"
                duration={256}
                ref={onRef as any}
                {...restProps}
            />
        );
    }
}

export { IAnimatableViewProps };
export default AnimatableView;

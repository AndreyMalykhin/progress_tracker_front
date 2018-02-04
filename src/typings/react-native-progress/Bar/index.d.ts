declare module "react-native-progress/Bar" {
    import * as React from "react";
    import { Animated } from "react-native";

    interface IProgressBarProps {
        animated?: boolean;
        indeterminate?: boolean;
        progress?: number;
        color?: string;
        unfilledColor?: string;
        borderWidth?: number;
        borderColor?: string;
        width?: number|null;
        height?: number;
        borderRadius?: number;
        useNativeDriver?: boolean;
        animationConfig?: Animated.TimingAnimationConfig
            | Animated.SpringAnimationConfig | Animated.DecayAnimationConfig;
        animationType?: "decay" | "timing" | "spring";
    }

    declare class ProgressBar extends React.Component<IProgressBarProps> {}

    export default ProgressBar;
}

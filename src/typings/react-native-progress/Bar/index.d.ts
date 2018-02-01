declare module "react-native-progress/Bar" {
    import * as React from "react";

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
        animationConfig?: {
            bounciness?: number;
        };
        animationType?: "decay" | "timeing" | "spring";
    }

    declare class ProgressBar extends React.Component<IProgressBarProps> {}

    export default ProgressBar;
}

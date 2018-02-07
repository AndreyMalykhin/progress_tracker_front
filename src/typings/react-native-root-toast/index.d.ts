
declare module "react-native-root-toast" {
    import * as React from "react";
    import { StyleProp, TextStyle, ViewStyle } from "react-native";

    interface IToastProps {
        animation?: boolean;
        containerStyle?: StyleProp<ViewStyle>;
        textStyle?: StyleProp<TextStyle>;
        visible?: boolean;
        hideOnPress?: boolean;
        duration?: number;
        position?: number;
        shadow?: boolean;
        opacity?: number;
        onHidden?: () => void;
    }

    declare class Toast extends React.Component<IToastProps> {}

    export default Toast;
}

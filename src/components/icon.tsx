import {
    iconStyle,
    rem,
    severityColor,
    stateColor,
    touchableStyle,
} from "components/common-styles";
import * as React from "react";
import { StyleProp, StyleSheet, TextStyle } from "react-native";
import { IconProps } from "react-native-vector-icons/Icon";
import IconImpl from "react-native-vector-icons/MaterialCommunityIcons";

interface IIconProps extends IconProps {
    active?: boolean;
    activeStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
    disabledStyle?: StyleProp<TextStyle>;
    dangerous?: boolean;
    dangerousStyle?: StyleProp<TextStyle>;
}

class Icon extends React.Component<IIconProps> {
    public render() {
        const {
            style,
            size,
            disabled,
            disabledStyle,
            active,
            activeStyle,
            dangerous,
            dangerousStyle,
            ...restProps,
        } = this.props;
        const newStyle = [
            styles.icon,
            style,
            active && styles.iconActive,
            active && activeStyle,
            dangerous && styles.iconDangerous,
            dangerous && dangerousStyle,
            disabled && styles.iconDisabled,
            disabled && disabledStyle,
        ];
        return (
            <IconImpl
                size={size || rem(3.2)}
                style={newStyle as any}
                {...restProps}
            />
        );
    }
}

const styles = StyleSheet.create({
    icon: {
        ...iconStyle,
        backgroundColor: "transparent",
    },
    iconActive: {
        color: stateColor.active,
    },
    iconDangerous: {
        color: severityColor.danger,
    },
    iconDisabled: {
        color: stateColor.disabled,
    },
});

export { IIconProps };
export default Icon;

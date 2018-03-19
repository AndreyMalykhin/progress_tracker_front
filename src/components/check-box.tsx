import Button, { ButtonIcon } from "components/button";
import { iconStyle, touchableStyle } from "components/common-styles";
import Icon from "components/icon";
import * as React from "react";
import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import IconName from "utils/icon-name";
import Sound from "utils/sound";

interface ICheckBoxProps {
    isChecked?: boolean;
    isDisabled?: boolean;
    isAnimationDisabled?: boolean;
    style?: StyleProp<ViewStyle>;
    iconCheckedStyle?: StyleProp<ViewStyle>;
    sound?: Sound;
    onPress?: (isChecked: boolean) => void;
}

class CheckBox extends React.PureComponent<ICheckBoxProps> {
    public render() {
        const {
            isChecked,
            iconCheckedStyle,
            isDisabled,
            isAnimationDisabled,
            children,
            style,
            sound,
            onPress,
        } = this.props;
        const iconName = isChecked ? IconName.Checked : IconName.Unchecked;
        return (
            <Button
                sound={sound}
                disabled={isDisabled}
                isAnimationDisabled={isAnimationDisabled}
                onPress={onPress && this.onPress}
                style={[styles.container, style]}
            >
                <ButtonIcon
                    active={isChecked}
                    activeStyle={iconCheckedStyle}
                    disabled={isDisabled}
                    style={styles.icon}
                    name={iconName}
                    component={Icon}
                />
                {children}
            </Button>
        );
    }

    private onPress = () => this.props.onPress!(!this.props.isChecked);
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
    },
    icon: {
        ...iconStyle,
        alignSelf: "flex-start",
    },
});

export { ICheckBoxProps };
export default CheckBox;

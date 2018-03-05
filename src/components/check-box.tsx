import Button, { ButtonIcon } from "components/button";
import * as React from "react";
import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import IconName from "utils/icon-name";
import Sound from "utils/sound";

interface ICheckBoxProps {
    isChecked?: boolean;
    isDisabled?: boolean;
    isAnimationDisabled?: boolean;
    style?: StyleProp<ViewStyle>;
    sound?: Sound;
    onPress?: (isChecked: boolean) => void;
}

class CheckBox extends React.PureComponent<ICheckBoxProps> {
    public render() {
        const {
            isChecked,
            isDisabled,
            isAnimationDisabled,
            children,
            style,
            sound,
            onPress,
        } = this.props;
        const iconName = isChecked ? IconName.Checked : IconName.Unchecked;
        const iconStyle = isChecked ? iconCheckedStyle : styles.icon;
        return (
            <Button
                sound={sound}
                disabled={isDisabled}
                isAnimationDisabled={isAnimationDisabled}
                onPress={onPress && this.onPress}
                style={[styles.container, style]}
            >
                <ButtonIcon
                    disabled={isDisabled}
                    style={iconStyle}
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
        padding: 0,
    },
    icon: {
        alignSelf: "flex-start",
        color: "#000",
    },
    iconChecked: {
        color: "#0076ff",
    },
});

const iconCheckedStyle = [styles.icon, styles.iconChecked];

export { ICheckBoxProps };
export default CheckBox;

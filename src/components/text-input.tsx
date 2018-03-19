import Button, { ButtonIcon } from "components/button";
import {
    gap,
    rem,
    severityColor,
    shadeColor,
    stateColor,
    touchableStyle,
    typographyStyle,
} from "components/common-styles";
import Icon from "components/icon";
import * as React from "react";
import {
    StyleProp,
    StyleSheet,
    TextInput as TextInputImpl,
    TextInputProperties,
    View,
    ViewStyle,
} from "react-native";
import IconName from "utils/icon-name";

interface ITextInputProps extends TextInputProperties {
    borderless?: boolean;
    disabled?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    clearable?: boolean;
    invalid?: boolean;
    onClear?: () => void;
    onRef?: (ref?: TextInput) => void;
}

class TextInput extends React.Component<ITextInputProps> {
    public render() {
        const {
            invalid,
            clearable,
            style,
            containerStyle,
            disabled,
            editable,
            borderless,
            onRef,
            ...restProps,
        } = this.props;
        const newContainerStyle = [
            styles.container,
            containerStyle,
            borderless && styles.containerBorderless,
            invalid && styles.containerInvalid,
            disabled && styles.containerDisabled,
        ];
        const controlStyle = [
            styles.control,
            style,
            disabled && styles.controlDisabled,
        ];
        return (
            <View style={newContainerStyle as any}>
                <TextInputImpl
                    ref={onRef as any}
                    style={controlStyle as any}
                    editable={!disabled && (editable == null || editable)}
                    underlineColorAndroid="transparent"
                    {...restProps}
                />
                {clearable && this.renderClearBtn()}
            </View>
        );
    }

    private renderClearBtn() {
        return (
            <Button onPress={this.props.onClear}>
                <ButtonIcon
                    component={Icon}
                    name={IconName.Remove}
                />
            </Button>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: shadeColor.dark,
        flexDirection: "row",
    },
    containerBorderless: {
        borderColor: "transparent",
    },
    containerDisabled: {
        borderColor: stateColor.disabled,
    },
    containerInvalid: {
        borderColor: severityColor.danger,
    },
    control: {
        ...typographyStyle.body,
        borderBottomWidth: 0,
        flex: 1,
        height: touchableStyle.minHeight,
        marginTop: rem(0.4),
    },
    controlDisabled: {
        color: stateColor.disabled,
    },
});

export { ITextInputProps };
export default TextInput;

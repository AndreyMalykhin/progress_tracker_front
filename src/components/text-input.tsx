import Button, { ButtonIcon } from "components/button";
import * as React from "react";
import {
    StyleProp,
    StyleSheet,
    TextInput as TextInputImpl,
    TextInputProperties,
    View,
    ViewStyle,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface ITextInputProps extends TextInputProperties {
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
            onRef,
            ...restProps,
        } = this.props;
        const newContainerStyle = [
            styles.container,
            containerStyle,
            invalid ? styles.containerInvalid : null,
            disabled ? styles.containerDisabled : null,
        ];
        let newEditable = editable;

        if (disabled) {
            newEditable = false;
        }

        const controlStyle = [
            styles.control,
            style,
            disabled ? styles.controlDisabled : null,
        ];
        return (
            <View style={newContainerStyle as any}>
                <TextInputImpl
                    ref={onRef as any}
                    style={controlStyle as any}
                    editable={newEditable}
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
                <ButtonIcon component={Icon} name="close-circle" />
            </Button>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderBottomWidth: 1,
        flexDirection: "row",
    },
    containerDisabled: {
        borderColor: "#ccc",
    },
    containerInvalid: {
        borderColor: "#f00",
    },
    control: {
        borderBottomWidth: 0,
        flex: 1,
        height: 32,
        marginTop: 4,
    },
    controlDisabled: {
        color: "#ccc",
    },
});

export { ITextInputProps };
export default TextInput;

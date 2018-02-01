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
            onRef,
            ...restProps,
        } = this.props;
        const newContainerStyle = [
            styles.container,
            containerStyle,
            invalid ? styles.containerInvalid : null,
        ];
        return (
            <View style={newContainerStyle as any}>
                <TextInputImpl
                    ref={onRef as any}
                    style={[styles.control, style]}
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
    containerInvalid: {
        borderColor: "#f00",
    },
    control: {
        borderBottomWidth: 0,
        flex: 1,
        height: 32,
        marginTop: 4,
    },
});

export { ITextInputProps };
export default TextInput;

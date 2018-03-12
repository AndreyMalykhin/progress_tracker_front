import {
    SeverityColor,
    StateColor,
    TypographyStyle,
} from "components/common-styles";
import * as React from "react";
import {
    StyleProp,
    StyleSheet,
    Text as TextImpl,
    TextProperties,
    TextStyle,
} from "react-native";

interface ITextProps extends TextProperties {
    active?: boolean;
    activeStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
    disabledStyle?: StyleProp<TextStyle>;
    dangerous?: boolean;
    dangerousStyle?: StyleProp<TextStyle>;
}

class Text extends React.Component<ITextProps> {
    public render() {
        const {
            style,
            active,
            activeStyle,
            disabled,
            disabledStyle,
            dangerous,
            dangerousStyle,
            ...restProps,
        } = this.props;
        const newStyle = [
            style,
            active && styles.textActive,
            active && activeStyle,
            dangerous && styles.textDangerous,
            dangerous && dangerousStyle,
            disabled && styles.textDisabled,
            disabled && disabledStyle,
        ];
        return <TextImpl style={newStyle as any} {...restProps} />;
    }
}

const styles = StyleSheet.create({
    textActive: {
        color: StateColor.active,
    },
    textDangerous: {
        color: SeverityColor.danger,
    },
    textDisabled: {
        color: StateColor.disabled,
    },
});

export { ITextProps };
export default Text;

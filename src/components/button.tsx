import TouchableWithFeedback, { ITouchableWithFeedbackProps } from "components/touchable-with-feedback";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
} from "react-native";
import { IconProps } from "react-native-vector-icons/Icon";

interface IButtonProps extends ITouchableWithFeedbackProps {
    isVertical?: boolean;
}

interface IButtonTitleProps {
    disabled?: boolean;
    style?: StyleProp<TextStyle>;
    msgId: string;
    msgValues?: { [key: string]: string };
}

interface IButtonIconProps extends IconProps {
    disabled?: boolean;
    component: React.ComponentType<IconProps>;
}

class Button extends React.Component<IButtonProps> {
    public render() {
        const { children, disabled, style, isVertical, ...restProps } =
            this.props;
        const contentStyle =
            isVertical ? contentVerticalStyle : styles.content;
        return (
            <TouchableWithFeedback
                disabled={disabled}
                style={[styles.container, style]}
                {...restProps}
            >
                <View style={contentStyle}>{children}</View>
            </TouchableWithFeedback>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class ButtonTitle extends React.PureComponent<IButtonTitleProps> {
    public render() {
        const { msgId, msgValues, disabled, style } = this.props;
        const baseStyle = disabled ? titleDisabledStyle : titleStyle;
        return (
            <Text style={[baseStyle, style]}>
                <FormattedMessage id={msgId} values={msgValues} />
            </Text>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class ButtonIcon extends React.PureComponent<IButtonIconProps> {
    public render() {
        const { component: Component, style, disabled, ...restProps } =
            this.props;
        const newStyle = [
            styles.text,
            style,
            disabled ? styles.iconDisabled : null,
        ];
        return <Component style={newStyle as any} size={32} {...restProps} />;
    }
}

const styles = StyleSheet.create({
    container: {},
    content: {
        alignItems: "center",
        flexDirection: "row",
    },
    iconDisabled: {
        color: "#ccc",
    },
    text: {
        color: "#0076ff",
    },
    textContainerDisabled: {
        opacity: 0.33,
    },
    textContainerVertical: {
        flexDirection: "column",
    },
    title: {
        lineHeight: 32,
        paddingHorizontal: 4,
    },
    titleDisabled: {
        color: "#ccc",
    },
});

const titleStyle = [styles.text, styles.title];
const titleDisabledStyle = [titleStyle, styles.titleDisabled];
const contentVerticalStyle =
    [styles.content, styles.textContainerVertical];

export { IButtonProps, ButtonTitle, ButtonIcon };
export default Button;

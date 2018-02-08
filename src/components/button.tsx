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
    vertical?: boolean;
}

interface IButtonTitleProps {
    primary?: boolean;
    disabled?: boolean;
    dangerous?: boolean;
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
        const { children, disabled, style, vertical, ...restProps } =
            this.props;
        const contentStyle =
            vertical ? contentVerticalStyle : styles.content;
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
        const { msgId, msgValues, disabled, style, primary, dangerous } =
            this.props;
        const newStyle = [
            styles.text,
            styles.title,
            style,
            primary ? styles.titlePrimary : null,
            dangerous ? styles.titleDangerous : null,
            disabled ? styles.textDisabled : null,
        ];
        return (
            <Text style={newStyle as any}>
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
            disabled ? styles.textDisabled : null,
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
    text: {
        color: "#0076ff",
    },
    textContainerVertical: {
        flexDirection: "column",
    },
    textDisabled: {
        color: "#ccc",
    },
    title: {
        lineHeight: 32,
    },
    titleDangerous: {
        color: "#ff3b30",
    },
    titlePrimary: {
        fontWeight: "bold",
    },
});

const contentVerticalStyle =
    [styles.content, styles.textContainerVertical];

export { IButtonProps, ButtonTitle, ButtonIcon };
export default Button;
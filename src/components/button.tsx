import {
    BorderRadius,
    Color,
    FontWeightStyle,
    Gap,
    SeverityColor,
    StateColor,
    TouchableStyle,
} from "components/common-styles";
import { IIconProps } from "components/icon";
import Loader from "components/loader";
import Text from "components/text";
import TouchableWithFeedback, {
    ITouchableWithFeedbackProps,
} from "components/touchable-with-feedback";
import { BodyText } from "components/typography";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import {
    StyleProp,
    StyleSheet,
    TextStyle,
    View,
} from "react-native";

interface IButtonProps extends ITouchableWithFeedbackProps {
    raised?: boolean;
    vertical?: boolean;
    loading?: boolean;
}

interface IButtonTitleProps {
    raised?: boolean;
    primary?: boolean;
    disabled?: boolean;
    dangerous?: boolean;
    style?: StyleProp<TextStyle>;
    msgId: string;
    msgValues?: { [key: string]: string };
}

interface IButtonIconProps extends IIconProps {
    raised?: boolean;
    component: React.ComponentType<IIconProps>;
}

class Button extends React.Component<IButtonProps> {
    public render() {
        const {
            children,
            loading,
            disabled,
            style,
            vertical,
            raised,
            ...restProps,
        } = this.props;
        let content;

        if (loading) {
            content = <Loader isNoFillParent={true} size="small" />;
        } else {
            const contentStyle =
                vertical ? contentVerticalStyle : styles.content;
            content = <View style={contentStyle}>{children}</View>;
        }

        const newStyle = [
            styles.container,
            raised && styles.containerRaised,
            style,
            disabled && raised && styles.containerRaisedDisabled,
        ];
        return (
            <TouchableWithFeedback
                disabled={disabled}
                style={newStyle as any}
                {...restProps}
            >
                {content}
            </TouchableWithFeedback>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class ButtonTitle extends React.PureComponent<IButtonTitleProps> {
    public render() {
        const { msgId, msgValues, disabled, style, primary, dangerous, raised }
            = this.props;
        const newStyle = [
            styles.title,
            style,
            primary && styles.titlePrimary,
        ];
        return (
            <BodyText
                active={true}
                activeStyle={raised && styles.titleRaised}
                disabled={disabled}
                disabledStyle={raised && styles.titleRaisedDisabled}
                dangerous={dangerous}
                style={newStyle as any}
            >
                <FormattedMessage id={msgId} values={msgValues} />
            </BodyText>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class ButtonIcon extends React.PureComponent<IButtonIconProps> {
    public render() {
        const { component: Component, style, raised, ...restProps } =
            this.props;
        return (
            <Component
                active={true}
                activeStyle={raised && styles.iconRaised}
                style={[styles.icon, style]}
                {...restProps}
            />
        );
    }
}

const minHeight = TouchableStyle.minHeight;
const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        minHeight,
        minWidth: TouchableStyle.minWidth,
    },
    containerRaised: {
        backgroundColor: TouchableStyle.color,
        borderRadius: minHeight / 2,
        paddingLeft: Gap.double,
        paddingRight: Gap.double,
    },
    containerRaisedDisabled: {
        backgroundColor: StateColor.disabled,
    },
    content: {
        alignItems: "center",
        flexDirection: "row",
    },
    icon: {
        lineHeight: minHeight,
    },
    iconRaised: {
        color: Color.white,
    },
    textContainerVertical: {
        flexDirection: "column",
    },
    title: {
        lineHeight: minHeight,
        paddingLeft: Gap.single,
        paddingRight: Gap.single,
    },
    titlePrimary: {
        ...FontWeightStyle.bold,
    },
    titleRaised: {
        color: Color.white,
    },
    titleRaisedDisabled: {
        color: Color.white,
    },
});

const contentVerticalStyle =
    [styles.content, styles.textContainerVertical];

export { IButtonProps, ButtonTitle, ButtonIcon };
export default Button;

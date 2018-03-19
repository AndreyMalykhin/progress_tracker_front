import Avatar from "components/avatar";
import CommandBar, { ICommandBarProps } from "components/command-bar";
import {
    cardStyle,
    color,
    fontWeightStyle,
    gap,
    iconStyle,
    rem,
    shadeColor,
    touchableStyle,
    typographyStyle,
} from "components/common-styles";
import Image from "components/image";
import Text from "components/text";
import { Caption1Text, HeadlineText, SubheadText } from "components/typography";
import * as React from "react";
import {
    StyleProp,
    StyleSheet,
    TextStyle,
    TouchableWithoutFeedback,
    TouchableWithoutFeedbackProperties,
    View,
    ViewProperties,
} from "react-native";
import { IconProps } from "react-native-vector-icons/Icon";

interface ICardProps extends ViewProperties {
    onLongPress?: () => void;
    onPressOut?: () => void;
    onPressIn?: () => void;
    onRef?: (ref?: View) => void;
}

interface ICardAvatarProps {
    uri: string;
}

interface ICardHeaderProps extends ViewProperties {
    isPrimary?: boolean;
}

type ICardBodyProps = ViewProperties;

interface ICardTitleProps {
    style?: StyleProp<TextStyle>;
    text: string;
    isPrimary?: boolean;
    onPress?: () => void;
}

interface ICardIconProps extends IconProps {
    component: React.ComponentType<IconProps>;
}

type ICardCommandBarProps = ICommandBarProps & {
    style?: null;
};

class Card extends React.Component<ICardProps> {
    public render() {
        const {
            onLongPress,
            onPressOut,
            onPressIn,
            onRef,
            style,
            children,
            ...restProps } = this.props;
        return (
            <TouchableWithoutFeedback
                disabled={onLongPress == null}
                onLongPress={onLongPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
            >
                <View
                    ref={onRef as any}
                    style={[styles.container, style]}
                    {...restProps}
                >
                    {children}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class CardBody extends React.Component<ICardBodyProps> {
    public render() {
        const { style, ...restProps } = this.props;
        return <View style={[styles.body, style]} {...restProps}/>;
    }
}

// tslint:disable-next-line:max-classes-per-file
class CardHeader extends React.Component<ICardHeaderProps> {
    public render() {
        const { style, isPrimary, children, ...restProps } = this.props;
        const newStyle = [
            styles.header,
            style,
            isPrimary && styles.headerPrimary,
        ];
        return (
            <View style={newStyle as any} {...restProps}>{children}</View>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class CardTitle extends React.PureComponent<ICardTitleProps> {
    public render() {
        const { isPrimary, text, style, onPress } = this.props;
        const Component = isPrimary ? SubheadText : HeadlineText;
        return (
            <Component
                numberOfLines={2}
                style={[styles.title, style, isPrimary && styles.titlePrimary]}
                onPress={onPress}
            >
                {this.props.text}
            </Component>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class CardAvatar extends React.PureComponent<ICardAvatarProps> {
    public render() {
        const { uri } = this.props;
        return (
            <Avatar size="small" uri={uri} style={styles.avatar} />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class CardIcon extends React.PureComponent<ICardIconProps> {
    public render() {
        const { component: Component, style, ...restProps } = this.props;
        return (
            <Component style={[styles.icon, style]} {...restProps} />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class CardCommandBar extends React.PureComponent<ICardCommandBarProps> {
    public render() {
        const { style, ...restProps } = this.props;
        return (
            <CommandBar
                style={styles.commandBar}
                {...restProps}
            />
        );
    }
}

const styles = StyleSheet.create({
    avatar: {
        marginRight: gap.single,
    },
    body: {
        paddingBottom: gap.single,
        paddingLeft: gap.single,
        paddingRight: gap.single,
    },
    commandBar: {
        paddingLeft: gap.single,
    },
    container: {
        ...cardStyle,
    },
    header: {
        alignItems: "center",
        flexDirection: "row",
        minHeight: touchableStyle.minHeight,
        paddingBottom: gap.single,
        paddingLeft: gap.single,
        paddingRight: gap.single,
        paddingTop: gap.single,
    },
    headerPrimary: {
        borderBottomWidth: 1,
        borderColor: shadeColor.light2,
        marginLeft: gap.single,
        marginRight: gap.single,
        paddingLeft: 0,
        paddingRight: 0,
    },
    icon: {
        paddingRight: gap.single,
    },
    title: {
        flex: 1,
        paddingBottom: rem(0.4),
    },
    titlePrimary: {},
});

export {
    CardHeader,
    CardTitle,
    CardIcon,
    CardCommandBar,
    CardBody,
    CardAvatar,
    ICardProps,
};
export default Card;

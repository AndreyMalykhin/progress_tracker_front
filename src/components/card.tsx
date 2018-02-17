import Avatar from "components/avatar";
import CommandBar, { ICommandBarProps } from "components/command-bar";
import Image from "components/image";
import * as React from "react";
import {
    StyleSheet,
    Text,
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
        const { isPrimary, text, onPress } = this.props;
        return (
            <Text
                numberOfLines={2}
                style={[styles.title, isPrimary && styles.titlePrimary]}
                onPress={onPress}
            >
                {this.props.text}
            </Text>
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
            <Component
                size={32}
                style={[styles.icon, style]}
                {...restProps}
            />
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
        marginRight: 8,
    },
    body: {
        paddingLeft: 8,
        paddingRight: 8,
    },
    commandBar: {
        paddingLeft: 8,
    },
    container: {
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
    },
    headerPrimary: {
        borderBottomWidth: 1,
        paddingBottom: 8,
    },
    icon: {
        paddingRight: 8,
    },
    title: {
        flex: 1,
        lineHeight: 32,
    },
    titlePrimary: {
        fontWeight: "bold",
    },
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

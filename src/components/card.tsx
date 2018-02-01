import CommandBar, { ICommandBarProps } from "components/command-bar";
import * as React from "react";
import {
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
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

type ICardHeaderProps = ViewProperties;

interface ICardTitleProps {
    text: string;
}

interface ICardIconProps extends IconProps {
    component: React.ComponentType<IconProps>;
}

type ICardCommandBarProps = ICommandBarProps;

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
class CardHeader extends React.Component<ICardHeaderProps> {
    public render() {
        return <View style={styles.header}>{this.props.children}</View>;
    }
}

// tslint:disable-next-line:max-classes-per-file
class CardTitle extends React.PureComponent<ICardTitleProps> {
    public render() {
        return (
            <Text
                numberOfLines={1}
                style={styles.title}
            >
                {this.props.text}
            </Text>
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
        return <CommandBar style={[styles.commandBar, style]} {...restProps}/>;
    }
}

const styles = StyleSheet.create({
    commandBar: {
        paddingLeft: 8,
    },
    container: {
        borderWidth: 1,
        padding: 8,
    },
    header: {
        flexDirection: "row",
    },
    icon: {
        paddingRight: 8,
    },
    title: {
        flex: 1,
        lineHeight: 32,
    },
});

export { CardHeader, CardTitle, CardIcon, CardCommandBar, ICardProps };
export default Card;

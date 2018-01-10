import Touchable, { ITouchableProps } from "components/touchable";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import {
    StyleSheet,
    Text,
    TextProperties,
    View,
    ViewProperties,
} from "react-native";
import { IconProps } from "react-native-vector-icons/Icon";

interface ITabBarItemTitleProps extends TextProperties {
    active?: boolean;
    msgId: string;
    msgValues?: { [key: string]: string };
}

interface ITabBarItemProps extends ITouchableProps {
    active?: boolean;
    id: string;
    onSelect?: (itemId: string) => void;
}

interface ITabBarProps extends ViewProperties {
    onSelect: (itemId: string) => void;
}

interface ITabBarItemIconProps extends IconProps {
    active?: boolean;
    component: React.ComponentClass<IconProps>;
}

class TabBarItem extends React.Component<ITabBarItemProps> {
    public render() {
        const { id, active, onSelect, children, ...restProps} = this.props;
        const newChildren = React.Children.map(children, (child) => {
            return React.cloneElement(
                child as React.ReactElement<any>, { active });
        });
        return (
            <Touchable
                style={styles.item}
                onPress={this.onPress}
                {...restProps}
            >
                <View style={styles.itemInner}>{newChildren}</View>
            </Touchable>
        );
    }

    private onPress = () =>
        !this.props.active && this.props.onSelect!(this.props.id)
}

// tslint:disable-next-line:max-classes-per-file
class TabBarItemTitle extends React.PureComponent<ITabBarItemTitleProps> {
    public render() {
        const { active, msgId, msgValues, ...restProps } = this.props;
        const style =
            [styles.itemTitle, active ? styles.itemTitleActive : null];
        return (
            <Text style={style}>
                <FormattedMessage id={msgId} values={msgValues} />
            </Text>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class TabBarItemIcon extends React.PureComponent<ITabBarItemIconProps> {
    public render() {
        const { component: Component, active, ...restProps } = this.props;
        const color = active ? itemTitleActiveColor : undefined;
        return <Component size={32} color={color} {...restProps} />;
    }
}

// tslint:disable-next-line:max-classes-per-file
class TabBar extends React.Component<ITabBarProps> {
    public render() {
        const { children, onSelect, style, ...restProps } = this.props;
        const newChildren = React.Children.map(children, (child) => {
            return React.cloneElement(
                child as React.ReactElement<any>, { onSelect });
        });
        return (
            <View style={[styles.container, style]} {...restProps}>
                {newChildren}
            </View>
        );
    }
}

const itemTitleActiveColor = "#0076ff";

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-around",
    },
    item: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    itemInner: {
        alignItems: "center",
    },
    itemTitle: {
        flexDirection: "column",
    },
    itemTitleActive: {
        color: itemTitleActiveColor,
    },
});

export {
    TabBarItem,
    TabBarItemIcon,
    TabBarItemTitle,
    ITabBarItemTitleProps,
    ITabBarItemProps,
    ITabBarProps,
    ITabBarItemIconProps,
};
export default TabBar;

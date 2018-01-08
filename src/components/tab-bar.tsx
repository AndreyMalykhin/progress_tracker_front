import * as React from "react";
import { FormattedMessage } from "react-intl";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProperties,
    View,
    ViewProperties,
} from "react-native";

interface ITabBarItemTitleProps {
    active?: boolean;
    children: string;
}

interface ITabBarItemProps extends TouchableOpacityProperties {
    active?: boolean;
    id: string;
    onSelect?: (itemId: string) => void;
}

interface ITabBarProps extends ViewProperties {
    onSelect: (itemId: string) => void;
}

class Item extends React.Component<ITabBarItemProps> {
    public render() {
        const children = React.Children.map(this.props.children, (child) => {
            return React.cloneElement(child as React.ReactElement<any>,
                { active: this.props.active });
        });
        return (
            <TouchableOpacity
                style={[styles.item]}
                onPress={this.onPress}
                {...this.props}
            >
                {children}
            </TouchableOpacity>
        );
    }

    private onPress = () =>
        !this.props.active && this.props.onSelect!(this.props.id)
}

// tslint:disable-next-line:max-classes-per-file
class ItemTitle extends React.PureComponent<ITabBarItemTitleProps> {
    public render() {
        return (
            <Text style={this.props.active ? styles.itemTitleActive : null}>
                <FormattedMessage id={this.props.children} />
            </Text>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class TabBar extends React.Component<ITabBarProps> {
    public static Item = Item;
    public static ItemTitle = ItemTitle;

    public render() {
        const children = React.Children.map(this.props.children, (child) => {
            return React.cloneElement(child as React.ReactElement<any>,
                { onSelect: this.props.onSelect });
        });
        return (
            <View style={styles.container} {...this.props}>{children}</View>
        );
    }
}

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
    itemTitleActive: {
        color: "blue",
    },
});

export { ITabBarItemTitleProps, ITabBarItemProps, ITabBarProps };
export default TabBar;

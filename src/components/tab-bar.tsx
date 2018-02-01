import TouchableWithFeedback, { ITouchableWithFeedbackProps } from "components/touchable-with-feedback";
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

interface ITabBarItemProps extends ITouchableWithFeedbackProps {
    active?: boolean;
    id: string;
    onSelect: (id: string) => void;
}

type ITabBarProps = ViewProperties;

interface ITabBarItemIconProps extends IconProps {
    active?: boolean;
    component: React.ComponentClass<IconProps>;
}

class TabBar extends React.Component<ITabBarProps> {
    public render() {
        const { children, style, ...restProps } = this.props;
        return (
            <View style={[styles.container, style]} {...restProps}>
                {children}
            </View>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class TabBarItem extends React.Component<ITabBarItemProps> {
    public render() {
        const { id, active, style, onSelect, children, ...restProps} = this.props;
        return (
            <TouchableWithFeedback
                style={[styles.item, style]}
                disabled={this.props.active}
                onPress={this.onPress}
                {...restProps}
            >
                <View style={styles.itemContent}>{children}</View>
            </TouchableWithFeedback>
        );
    }

    private onPress = () => this.props.onSelect!(this.props.id);
}

// tslint:disable-next-line:max-classes-per-file
class TabBarItemTitle extends React.PureComponent<ITabBarItemTitleProps> {
    public render() {
        const { style, active, msgId, msgValues } = this.props;
        const baseStyle = active ? itemTitleActiveStyle : styles.itemTitle;
        return (
            <Text style={[baseStyle, style]}>
                <FormattedMessage id={msgId} values={msgValues} />
            </Text>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class TabBarItemIcon extends React.PureComponent<ITabBarItemIconProps> {
    public render() {
        const { component: Component, style, active, children, ...restProps } =
            this.props;
        const baseStyle = active ? itemIconActiveStyle : styles.itemIcon;
        return (
            <Component
                size={32}
                style={[baseStyle, style]}
                {...restProps}
            />
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
        paddingVertical: 8,
    },
    itemContent: {
        alignItems: "center",
    },
    itemIcon: {},
    itemIconActive: {
        color: "#0076ff",
    },
    itemTitle: {
        flexDirection: "column",
    },
    itemTitleActive: {
        color: "#0076ff",
    },
});

const itemTitleActiveStyle = [styles.itemTitle, styles.itemTitleActive];
const itemIconActiveStyle = [styles.itemIcon, styles.itemIconActive];

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

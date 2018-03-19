import {
    color,
    gap,
    stateColor,
    touchableStyle,
} from "components/common-styles";
import { IIconProps } from "components/icon";
import Text from "components/text";
import TouchableWithFeedback, {
    ITouchableWithFeedbackProps,
} from "components/touchable-with-feedback";
import { Caption1Text, SubheadText } from "components/typography";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import {
    StyleProp,
    StyleSheet,
    TextProperties,
    TextStyle,
    View,
    ViewProperties,
    ViewStyle,
} from "react-native";

interface ITabBarItemTitleProps extends TextProperties {
    active?: boolean;
    activeStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
    msgId: string;
    msgValues?: { [key: string]: string };
}

interface ITabBarItemProps extends ITouchableWithFeedbackProps {
    active?: boolean;
    activeStyle?: StyleProp<ViewStyle>;
    id: string;
    onSelect: (id: string) => void;
}

type ITabBarProps = ViewProperties;

interface ITabBarItemIconProps extends IIconProps {
    disabled?: boolean;
    component: React.ComponentType<IIconProps>;
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
        const {
            id,
            active,
            disabled,
            activeStyle,
            style,
            onSelect,
            children,
            ...restProps,
        } = this.props;
        return (
            <TouchableWithFeedback
                style={[styles.item, style, active && activeStyle]}
                disabled={disabled || active}
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
        const { style, active, activeStyle, disabled, msgId, msgValues } =
            this.props;
        return (
            <SubheadText
                active={active}
                disabled={disabled}
                style={[styles.itemTitle, style]}
                activeStyle={activeStyle}
                numberOfLines={1}
            >
                <FormattedMessage id={msgId} values={msgValues} />
            </SubheadText>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class TabBarItemIcon extends React.PureComponent<ITabBarItemIconProps> {
    public render() {
        const { component: Component, ...restProps } = this.props;
        return <Component {...restProps} />;
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: color.white,
        flexDirection: "row",
        justifyContent: "space-around",
    },
    item: {
        flex: 1,
        minHeight: touchableStyle.minHeight,
    },
    itemContent: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    itemTitle: {
        flexDirection: "column",
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

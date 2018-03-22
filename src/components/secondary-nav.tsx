import {
    borderRadius,
    color,
    gap,
    shadeColor,
    stateColor,
    touchableStyle,
    typographyStyle,
} from "components/common-styles";
import NavBar, {
    INavBarItem,
    INavBarItemRenderer,
    INavBarProps,
} from "components/nav-bar";
import TabBar, {
    TabBarItem,
    TabBarItemIcon,
    TabBarItemTitle,
} from "components/tab-bar";
import * as React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface ISecondaryNavProps {
    items: INavBarItem[];
    style?: StyleProp<ViewStyle>;
}

class SecondaryNav extends React.Component<ISecondaryNavProps> {
    public render() {
        return (
            <NavBar
                renderItem={this.renderItem}
                items={this.props.items}
                style={[styles.container, this.props.style]}
            />
        );
    }

    private renderItem: INavBarItemRenderer = (
        path, isActive, onSelect, titleMsgId, iconName, isDisabled, onPreSelect,
    ) => {
        const contentStyle =
            [styles.itemContent, isActive && styles.itemContentActive];
        return (
            <TabBarItem
                key={path}
                id={path}
                active={isActive}
                disabled={isDisabled}
                style={styles.item}
                activeStyle={styles.itemActive}
                onSelect={onSelect}
                onPreSelect={onPreSelect}
            >
                <View style={contentStyle as any}>
                    <TabBarItemTitle
                        disabled={isDisabled}
                        active={isActive}
                        msgId={titleMsgId!}
                        style={styles.itemTitle}
                        activeStyle={styles.itemTitleActive}
                    />
                </View>
            </TabBarItem>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        borderColor: shadeColor.light3,
    },
    item: {
        paddingBottom: gap.single,
        paddingLeft: gap.single,
        paddingRight: gap.single,
        paddingTop: gap.single,
    },
    itemActive: {},
    itemContent: {
        alignItems: "center",
        alignSelf: "stretch",
        borderRadius: borderRadius.double,
        flex: 1,
        justifyContent: "center",
    },
    itemContentActive: {
        backgroundColor: stateColor.active,
    },
    itemTitle: {},
    itemTitleActive: {
        color: color.white,
    },
});

export { ISecondaryNavProps };
export default SecondaryNav;

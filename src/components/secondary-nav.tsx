import {
    BorderColor,
    BorderRadius,
    Color,
    Gap,
    StateColor,
    TouchableStyle,
    TypographyStyle,
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
import { StyleSheet, View } from "react-native";

interface ISecondaryNavProps {
    items: INavBarItem[];
}

class SecondaryNav extends React.Component<ISecondaryNavProps> {
    public render() {
        return (
            <NavBar
                renderItem={this.renderItem}
                items={this.props.items}
                style={styles.container}
            />
        );
    }

    private renderItem: INavBarItemRenderer = (
        path, isActive, onSelect, titleMsgId, iconName,
    ) => {
        const contentStyle =
            [styles.itemContent, isActive && styles.itemContentActive];
        return (
            <TabBarItem
                key={path}
                id={path}
                active={isActive}
                style={styles.item}
                activeStyle={styles.itemActive}
                onSelect={onSelect}
            >
                <View style={contentStyle as any}>
                    <TabBarItemTitle
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
        borderColor: BorderColor.light,
    },
    item: {
        paddingBottom: Gap.single,
        paddingLeft: Gap.single,
        paddingRight: Gap.single,
        paddingTop: Gap.single,
    },
    itemActive: {},
    itemContent: {
        alignItems: "center",
        alignSelf: "stretch",
        borderRadius: BorderRadius.double,
        flex: 1,
        justifyContent: "center",
    },
    itemContentActive: {
        backgroundColor: StateColor.active,
    },
    itemTitle: {},
    itemTitleActive: {
        color: Color.white,
    },
});

export { ISecondaryNavProps };
export default SecondaryNav;

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
import { StyleSheet } from "react-native";

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
        return (
            <TabBarItem
                key={path}
                id={path}
                active={isActive}
                style={styles.item}
                activeStyle={styles.itemActive}
                onSelect={onSelect}
            >
                <TabBarItemTitle
                    active={isActive}
                    msgId={titleMsgId!}
                    style={styles.itemTitle}
                    activeStyle={styles.itemTitleActive}
                />
            </TabBarItem>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
    },
    item: {
        borderRadius: 16,
        marginBottom: 8,
        marginLeft: 8,
        marginRight: 8,
        marginTop: 8,
        paddingBottom: 4,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 4,
    },
    itemActive: {
        backgroundColor: "#0076ff",
    },
    itemTitle: {},
    itemTitleActive: {
        color: "#fff",
    },
});

export { ISecondaryNavProps };
export default SecondaryNav;

import NavBar, { INavBarItem, INavBarItemRenderer } from "components/nav-bar";
import TabBar, {
    TabBarItem,
    TabBarItemIcon,
    TabBarItemTitle,
} from "components/tab-bar";
import * as React from "react";
import { StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface IGlobalNavProps {
    items: INavBarItem[];
}

class GlobalNav extends React.Component<IGlobalNavProps> {
    public render() {
        return (
            <NavBar
                keepState={false}
                renderItem={this.renderItem}
                style={styles.container}
                items={this.props.items}
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
                onSelect={onSelect}
            >
                <TabBarItemIcon
                    active={isActive}
                    component={Icon}
                    name={iconName!}
                />
                <TabBarItemTitle
                    active={isActive}
                    msgId={titleMsgId!}
                />
            </TabBarItem>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 1,
    },
});

export { IGlobalNavProps };
export default GlobalNav;

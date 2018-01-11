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
                {...this.props}
            />
        );
    }

    private renderItem: INavBarItemRenderer = (path, isActive, title, icon) => {
        return (
            <TabBarItem key={path} id={path} active={isActive}>
                <TabBarItemIcon component={Icon} name={icon!} />
                <TabBarItemTitle msgId={title!} />
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

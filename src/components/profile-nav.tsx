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
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface IProfileNavProps {
    items: INavBarItem[];
}

class ProfileNav extends React.Component<IProfileNavProps> {
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
                onSelect={onSelect}
            >
                <TabBarItemIcon
                    active={isActive}
                    component={Icon}
                    name={iconName!}
                />
                <TabBarItemTitle active={isActive} msgId={titleMsgId!} />
            </TabBarItem>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
    },
});

export { IProfileNavProps };
export default ProfileNav;

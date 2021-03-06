import { headerStyle, shadeColor } from "components/common-styles";
import Icon from "components/icon";
import NavBar, { INavBarItem, INavBarItemRenderer } from "components/nav-bar";
import TabBar, {
    TabBarItem,
    TabBarItemIcon,
    TabBarItemTitle,
} from "components/tab-bar";
import * as React from "react";
import { StyleSheet } from "react-native";

interface IGlobalNavProps {
    items: INavBarItem[];
}

class GlobalNav extends React.Component<IGlobalNavProps> {
    public render() {
        return (
            <NavBar
                resetHistory={true}
                renderItem={this.renderItem}
                style={styles.container}
                items={this.props.items}
            />
        );
    }

    private renderItem: INavBarItemRenderer = (
        path, isActive, onSelect, titleMsgId, iconName, isDisabled, onPreSelect,
    ) => {
        return (
            <TabBarItem
                key={path}
                id={path}
                active={isActive}
                onSelect={onSelect}
                onPreSelect={onPreSelect}
            >
                <TabBarItemIcon
                    active={isActive}
                    component={Icon}
                    name={iconName!}
                />
            </TabBarItem>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: headerStyle.backgroundColor,
        borderColor: headerStyle.borderColor,
        borderTopWidth: 1,
    },
});

export { IGlobalNavProps };
export default GlobalNav;

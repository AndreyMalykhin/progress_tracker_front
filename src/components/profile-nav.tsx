import {
    color,
    gap,
    shadeColor,
    stateColor,
    typographyStyle,
} from "components/common-styles";
import Icon from "components/icon";
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

interface IProfileNavProps {
    items: INavBarItem[];
    isDisabled?: boolean;
}

class ProfileNav extends React.Component<IProfileNavProps> {
    public render() {
        return (
            <NavBar
                isDisabled={this.props.isDisabled}
                renderItem={this.renderItem}
                items={this.props.items}
                style={styles.container}
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
                disabled={isDisabled}
                onSelect={onSelect}
                onPreSelect={onPreSelect}
            >
                <TabBarItemIcon
                    active={isActive}
                    disabled={isDisabled}
                    component={Icon}
                    name={iconName!}
                />
                <TabBarItemTitle
                    disabled={isDisabled}
                    active={isActive}
                    msgId={titleMsgId!}
                    style={styles.itemTitle}
                />
            </TabBarItem>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        borderColor: shadeColor.light3,
        paddingBottom: gap.single,
        paddingTop: gap.single,
    },
    itemTitle: {
        ...typographyStyle.caption1,
    },
});

export { IProfileNavProps };
export default ProfileNav;

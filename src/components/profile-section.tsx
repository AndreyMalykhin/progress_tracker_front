import { Color, ListStyle } from "components/common-styles";
import { INavBarItem } from "components/nav-bar";
import ProfileNav from "components/profile-nav";
import StackingSwitch from "components/stacking-switch";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Route, Switch } from "react-router";
import makeLog from "utils/make-log";

interface IProfileSectionProps {
    navItems: IProfileSectionNavItem[];
    isContextMode?: boolean;
}

interface IProfileSectionNavItem extends INavBarItem {
    component: React.ComponentType;
}

const log = makeLog("profile-section");

class ProfileSection extends React.Component<IProfileSectionProps> {
    public render() {
        log.trace("render()");
        const { navItems, isContextMode } = this.props;
        const routeElements = this.props.navItems.map((route) => {
            return (
                <Route
                    key={route.matchPath}
                    exact={route.matchExact}
                    path={route.matchPath}
                    component={route.component}
                />
            );
        });
        return (
            <View style={styles.container}>
                <ProfileNav items={navItems} isDisabled={isContextMode} />
                <View style={styles.content}>
                    <StackingSwitch>{routeElements}</StackingSwitch>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Color.white,
        flex: 1,
    },
    content: {
        backgroundColor: ListStyle.backgroundColor,
        flex: 1,
    },
});

export { IProfileSectionProps, IProfileSectionNavItem };
export default ProfileSection;

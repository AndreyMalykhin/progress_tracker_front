import { INavBarItem } from "components/nav-bar";
import ProfileNav from "components/profile-nav";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Route, Switch } from "react-router";

type IProfileSectionNavItem = INavBarItem & {
    component: React.ComponentType;
};

interface IProfileSectionProps {
    navItems: IProfileSectionNavItem[];
}

class ProfileSection extends React.Component<IProfileSectionProps> {
    public render() {
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
                <ProfileNav items={this.props.navItems} />
                <View style={styles.content}>
                    <Switch>{routeElements}</Switch>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});

export { IProfileSectionProps, IProfileSectionNavItem };
export default ProfileSection;

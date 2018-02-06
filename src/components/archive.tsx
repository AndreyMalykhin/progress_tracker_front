import ArchiveNav from "components/archive-nav";
import { INavBarItem } from "components/nav-bar";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router";

interface IArchiveNavItem extends INavBarItem {
    render: (props: RouteComponentProps<any>) => JSX.Element;
}

interface IArchiveProps {
    navItems: IArchiveNavItem[];
}

class Archive extends React.Component<IArchiveProps> {
    public render() {
        const routeElements = this.props.navItems.map((route) => {
            return (
                <Route
                    key={route.matchPath}
                    exact={route.matchExact}
                    path={route.matchPath}
                    render={route.render}
                />
            );
        });
        return (
            <View style={styles.container}>
                <ArchiveNav items={this.props.navItems} />
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

export { IArchiveNavItem };
export default Archive;

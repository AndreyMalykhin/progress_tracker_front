import { INavBarItem } from "components/nav-bar";
import PendingReviewNav from "components/pending-review-nav";
import * as React from "react";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Route, RouteComponentProps, Switch } from "react-router";

interface IPendingReviewSectionNavItem extends INavBarItem {
    render: (props: RouteComponentProps<any>) => ReactNode;
}

interface IPendingReviewSectionProps {
    navItems: IPendingReviewSectionNavItem[];
}

class PendingReviewSection extends React.Component<IPendingReviewSectionProps> {
    public render() {
        const routes = this.props.navItems.map((route) => {
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
                <PendingReviewNav items={this.props.navItems} />
                <View style={styles.content}>
                    <Switch>{routes}</Switch>
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

export { IPendingReviewSectionProps, IPendingReviewSectionNavItem };
export default PendingReviewSection;

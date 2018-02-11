import ActivitiesSection from "components/activities-section";
import FriendsSection from "components/friends-section";
import GlobalNav from "components/global-nav";
import Header from "components/header";
import LeadersSection from "components/leaders-section";
import { INavBarItem } from "components/nav-bar";
import PendingReviewSectionContainer from "components/pending-review-section-container";
import ProfileSectionContainer from "components/profile-section-container";
import StackingSwitch from "components/stacking-switch";
import Audience from "models/audience";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Redirect, Route, Switch } from "react-router";
import myId from "utils/my-id";
import routes from "utils/routes";

type INavItem = INavBarItem & {
    component: React.ComponentType;
};

const myActiveTrackablesRoute = routes.profileActiveTrackables.path.replace(
    ":id", myId);
const navItems: INavItem[] = [
    {
        component: ProfileSectionContainer,
        iconName: "account",
        matchExact: routes.profile.exact,
        matchPath: routes.profile.path.replace(":id", myId),
        navigateToPath: myActiveTrackablesRoute,
        titleMsgId: "globalNavigation.profile",
    },
    {
        component: LeadersSection,
        iconName: "trophy",
        matchExact: routes.leaders.exact,
        matchPath: routes.leaders.path,
        navigateToPath: routes.leaders.path.replace(
            ":audience", Audience.Global),
        titleMsgId: "globalNavigation.leaders",
    },
    {
        component: PendingReviewSectionContainer,
        iconName: "approval",
        matchExact: routes.pendingReview.exact,
        matchPath: routes.pendingReview.path,
        navigateToPath:
            routes.pendingReview.path.replace(":audience", Audience.Global),
        titleMsgId: "globalNavigation.pendingReview",
    },
    {
        component: FriendsSection,
        iconName: "account-multiple",
        matchExact: routes.friends.exact,
        matchPath: routes.friends.path,
        navigateToPath: routes.friends.path,
        titleMsgId: "globalNavigation.friends",
    },
    {
        component: ActivitiesSection,
        iconName: "calendar",
        matchExact: routes.activities.exact,
        matchPath: routes.activities.path,
        navigateToPath: routes.activities.path.replace(
            ":audience", Audience.Me),
        titleMsgId: "globalNavigation.activities",
    },
];

class HomePage extends React.Component {
    public render() {
        const routeElements = navItems.map((navItem, i) => {
            return (
                <Route
                    key={i}
                    exact={navItem.matchExact}
                    path={navItem.matchPath}
                    component={navItem.component}
                />
            );
        });
        routeElements.push(
            <Route
                key={routeElements.length}
                exact={routes.profile.exact}
                path={routes.profile.path}
                component={ProfileSectionContainer}
            />,
        );
        routeElements.push(
            <Redirect
                key={routeElements.length}
                to={myActiveTrackablesRoute}
            />,
        );
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.content}>
                    <StackingSwitch>{routeElements}</StackingSwitch>
                </View>
                <GlobalNav items={navItems} />
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

export default HomePage;

import ActivitiesSectionContainer from "components/activities-section-container";
import FriendsSectionContainer from "components/friends-section-container";
import GlobalNav from "components/global-nav";
import Header from "components/header";
import LeadersSectionContainer from "components/leaders-section-container";
import { INavBarItem } from "components/nav-bar";
import PendingReviewSectionContainer from "components/pending-review-section-container";
import ProfileSectionContainer from "components/profile-section-container";
import StackingSwitch from "components/stacking-switch";
import Audience from "models/audience";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Redirect, Route, Switch } from "react-router";
import defaultId from "utils/default-id";
import IconName from "utils/icon-name";
import makeLog from "utils/make-log";
import routes from "utils/routes";

interface INavItem extends INavBarItem {
    component: React.ComponentType;
}

const log = makeLog("home-page");

const myActiveTrackablesRoute = routes.profileActiveTrackables.path.replace(
    ":id", defaultId);
const navItems: INavItem[] = [
    {
        component: ProfileSectionContainer,
        iconName: IconName.Profile,
        matchExact: routes.profile.exact,
        matchPath: routes.profile.path.replace(":id", defaultId),
        navigateToPath: myActiveTrackablesRoute,
        titleMsgId: "globalNavigation.profile",
    },
    {
        component: LeadersSectionContainer,
        iconName: IconName.Leaders,
        matchExact: routes.leaders.exact,
        matchPath: routes.leaders.path,
        navigateToPath: routes.leaders.path.replace(
            ":audience", Audience.Global),
        titleMsgId: "globalNavigation.leaders",
    },
    {
        component: PendingReviewSectionContainer,
        iconName: IconName.Review,
        matchExact: routes.pendingReview.exact,
        matchPath: routes.pendingReview.path,
        navigateToPath:
            routes.pendingReview.path.replace(":audience", Audience.Global),
        titleMsgId: "globalNavigation.pendingReview",
    },
    {
        component: FriendsSectionContainer,
        iconName: IconName.Friends,
        matchExact: routes.friends.exact,
        matchPath: routes.friends.path,
        navigateToPath: routes.friends.path,
        titleMsgId: "globalNavigation.friends",
    },
    {
        component: ActivitiesSectionContainer,
        iconName: IconName.Activity,
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

    public componentWillMount() {
        log.trace("componentWillMount()");
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

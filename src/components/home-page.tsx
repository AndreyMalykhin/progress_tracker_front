import ActivitiesSection from "components/activities-section";
import FriendsSection from "components/friends-section";
import GlobalNav from "components/global-nav";
import Header from "components/header";
import LeadersSection from "components/leaders-section";
import { INavBarItem } from "components/nav-bar";
import PendingReviewSectionContainer from "components/pending-review-section-container";
import ProfileSectionContainer from "components/profile-section-container";
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
        matchPath: routes.profile.path,
        navigateToPath: myActiveTrackablesRoute,
        titleMsgId: "globalNavigation.profile",
    },
    {
        component: LeadersSection,
        iconName: "trophy",
        matchExact: routes.leaders.exact,
        matchPath: routes.leaders.path,
        navigateToPath: routes.leadersGlobal.path,
        titleMsgId: "globalNavigation.leaders",
    },
    {
        component: PendingReviewSectionContainer,
        iconName: "approval",
        matchExact: routes.reviews.exact,
        matchPath: routes.reviews.path,
        navigateToPath: routes.reviewsGlobal.path,
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
        navigateToPath: routes.activitiesFriends.path,
        titleMsgId: "globalNavigation.activities",
    },
];

class HomePage extends React.Component {
    public render() {
        const routeElements = navItems.map((navItem) => {
            return (
                <Route
                    key={navItem.matchPath}
                    exact={navItem.matchExact}
                    path={navItem.matchPath}
                    component={navItem.component}
                />
            );
        });
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.content}>
                    <Switch>
                        {routeElements}
                        <Redirect to={myActiveTrackablesRoute} />
                    </Switch>
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

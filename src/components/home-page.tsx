import ActivitiesSection from "components/activities-section";
import FriendsSection from "components/friends-section";
import GlobalNav from "components/global-nav";
import Header from "components/header";
import LeadersSection from "components/leaders-section";
import ProfileSectionContainer from "components/profile-section-container";
import ReviewsSection from "components/reviews-section";
import * as React from "react";
import { View } from "react-native";
import { Redirect, Route, Switch } from "react-router";
import routes from "utils/routes";

const navItems = [
    {
        component: ProfileSectionContainer,
        icon: "account",
        matchExact: routes.profile.exact,
        matchPath: routes.profile.path,
        navigateToPath: routes.profileMyActiveTrackables.path,
        title: "globalNavigation.profile",
    },
    {
        component: LeadersSection,
        icon: "trophy",
        matchExact: routes.leaders.exact,
        matchPath: routes.leaders.path,
        navigateToPath: routes.leadersGlobal.path,
        title: "globalNavigation.leaders",
    },
    {
        component: ReviewsSection,
        icon: "approval",
        matchExact: routes.reviews.exact,
        matchPath: routes.reviews.path,
        navigateToPath: routes.reviewsGlobal.path,
        title: "globalNavigation.reviews",
    },
    {
        component: FriendsSection,
        icon: "account-multiple",
        matchExact: routes.friends.exact,
        matchPath: routes.friends.path,
        navigateToPath: routes.friends.path,
        title: "globalNavigation.friends",
    },
    {
        component: ActivitiesSection,
        icon: "calendar",
        matchExact: routes.activities.exact,
        matchPath: routes.activities.path,
        navigateToPath: routes.activitiesFriends.path,
        title: "globalNavigation.activities",
    },
];

class HomePage extends React.Component {
    public render() {
        const routeElements = navItems.map((route) => {
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
            <View style={{ flex: 1 }}>
                <Header />
                <View style={{ flex: 1 }}>
                    <Switch>
                        {routeElements}
                        <Redirect to={routes.profileMyActiveTrackables.path} />
                    </Switch>
                </View>
                <GlobalNav items={navItems} />
            </View>
        );
    }
}

export default HomePage;

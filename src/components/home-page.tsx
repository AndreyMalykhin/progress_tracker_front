import ActivitiesSection from "components/activities-section";
import FriendsSection from "components/friends-section";
import GlobalNav from "components/global-nav";
import Header from "components/header";
import LeadersSection from "components/leaders-section";
import ProfileSection from "components/profile-section";
import ReviewsSection from "components/reviews-section";
import * as React from "react";
import { View } from "react-native";
import { Redirect, Route, Switch } from "react-router";
import routes from "utils/routes";

const routeDefinitions = [
    {
        component: ProfileSection,
        exact: routes.profile.exact,
        matchPath: routes.profile.path,
        navigateToPath: routes.profileMyActiveTrackables.path,
        title: "globalNavigation.profile",
    },
    {
        component: LeadersSection,
        exact: routes.leaders.exact,
        matchPath: routes.leaders.path,
        navigateToPath: routes.leadersGlobal.path,
        title: "globalNavigation.leaders",
    },
    {
        component: ReviewsSection,
        exact: routes.reviews.exact,
        matchPath: routes.reviews.path,
        navigateToPath: routes.reviewsGlobal.path,
        title: "globalNavigation.reviews",
    },
    {
        component: FriendsSection,
        exact: routes.friends.exact,
        matchPath: routes.friends.path,
        navigateToPath: routes.friends.path,
        title: "globalNavigation.friends",
    },
    {
        component: ActivitiesSection,
        exact: routes.activities.exact,
        matchPath: routes.activities.path,
        navigateToPath: routes.activitiesFriends.path,
        title: "globalNavigation.activities",
    },
];

class HomePage extends React.Component {
    public render() {
        const routeElements = routeDefinitions.map((route) => {
            return (
                <Route
                    key={route.matchPath}
                    exact={route.exact}
                    path={route.matchPath}
                    component={route.component}
                />
            );
        });
        return (
            <View style={{ flex: 1 }}>
                <Header/>
                <View style={{ flex: 1 }}>
                    <Switch>
                        {routeElements}
                        <Redirect to={routes.profileMyActiveTrackables.path} />
                    </Switch>
                </View>
                <GlobalNav routes={routeDefinitions} />
            </View>
        );
    }
}

export default HomePage;

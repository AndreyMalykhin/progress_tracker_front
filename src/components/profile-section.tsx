import ActiveTrackables from "components/active-trackables";
import ArchivedTrackables from "components/archived-trackables";
import ProfileNav from "components/profile-nav";
import * as React from "react";
import { Text, View } from "react-native";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router";
import routes from "utils/routes";

type IProfileSectionProps = RouteComponentProps<{ id: string }>;

class ProfileSection extends React.Component<IProfileSectionProps> {
    private routeDefinitions = [
        {
            component: ActiveTrackables,
            exact: routes.profileActiveTrackables.exact,
            matchPath: routes.profileActiveTrackables.path,
            navigateToPath: routes.profileMyActiveTrackables.path,
            title: "profile.activeTrackables",
        },
        {
            component: ArchivedTrackables,
            exact: routes.profileArchive.exact,
            matchPath: routes.profileArchive.path,
            navigateToPath: routes.profileMyArchive.path,
            title: "profile.archive",
        },
    ];

    public render() {
        const routElements = this.routeDefinitions.map((route) => {
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
                <ProfileNav routes={this.routeDefinitions} />
                <View style={{ flex: 1 }}>
                    <Switch>{routElements}</Switch>
                </View>
            </View>
        );
    }

    public componentWillReceiveProps(nextProps: IProfileSectionProps) {
        const nextUserId = nextProps.match.params.id;

        if (this.props.match.params.id === nextUserId) {
            return;
        }

        this.routeDefinitions = this.routeDefinitions.map((route) => {
            return {
                ...route,
                navigateToPath: route.matchPath.replace(":id", nextUserId),
            };
        });
    }
}

export default withRouter(ProfileSection);

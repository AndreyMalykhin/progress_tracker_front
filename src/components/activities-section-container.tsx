import ActivitiesSection from "components/activities-section";
import { INavBarItem } from "components/nav-bar";
import withHeader, { IWithHeaderProps } from "components/with-header";
import Audience from "models/audience";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps } from "react-router";
import routes from "utils/routes";

interface IRouteParams {
    audience: Audience;
}

interface IActivitiesSectionContainerProps extends
    IWithHeaderProps, RouteComponentProps<IRouteParams> {}

const friendsAudienceRoute =
    routes.activities.path.replace(":audience", Audience.Friends);
const myAudienceRoute =
    routes.activities.path.replace(":audience", Audience.Me);
const navItems: INavBarItem[] = [
    {
        matchExact: routes.activities.exact,
        matchPath: friendsAudienceRoute,
        navigateToPath: friendsAudienceRoute,
        titleMsgId: "activitiesNavigation.friends",
    },
    {
        matchExact: routes.activities.exact,
        matchPath: myAudienceRoute,
        navigateToPath: myAudienceRoute,
        titleMsgId: "activitiesNavigation.my",
    },
];

class ActivitiesSectionContainer extends
    React.Component<IActivitiesSectionContainerProps> {
    public render() {
        return (
            <ActivitiesSection
                audience={this.props.match.params.audience}
                navItems={navItems}
            />
        );
    }

    public componentWillMount() {
        this.updateHeader();
    }

    public componentWillReceiveProps(
        nextProps: IActivitiesSectionContainerProps,
    ) {
        if (nextProps.header.isEmpty()) {
            this.updateHeader();
        }
    }

    private updateHeader() {
        this.props.header.replace({
            title: <FormattedMessage id="globalNavigation.activities" />,
        });
    }
}

export default withHeader(ActivitiesSectionContainer);

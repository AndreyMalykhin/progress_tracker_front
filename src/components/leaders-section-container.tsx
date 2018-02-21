import LeadersSection from "components/leaders-section";
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

interface ILeadersSectionContainerProps extends
    IWithHeaderProps, RouteComponentProps<IRouteParams> {}

const friendsAudienceRoute =
    routes.leaders.path.replace(":audience", Audience.Friends);
const globalAudienceRoute =
    routes.leaders.path.replace(":audience", Audience.Global);
const navItems: INavBarItem[] = [
    {
        matchExact: routes.leaders.exact,
        matchPath: globalAudienceRoute,
        navigateToPath: globalAudienceRoute,
        titleMsgId: "leadersNavigation.global",
    },
    {
        matchExact: routes.leaders.exact,
        matchPath: friendsAudienceRoute,
        navigateToPath: friendsAudienceRoute,
        titleMsgId: "leadersNavigation.friends",
    },
];

class LeadersSectionContainer extends
    React.Component<ILeadersSectionContainerProps> {
    public render() {
        return (
            <LeadersSection
                audience={this.props.match.params.audience}
                navItems={navItems}
            />
        );
    }

    public componentWillMount() {
        this.updateHeader();
    }

    public componentWillReceiveProps(
        nextProps: ILeadersSectionContainerProps,
    ) {
        if (nextProps.header.isEmpty()) {
            this.updateHeader();
        }
    }

    private updateHeader() {
        this.props.header.replace({
            title: <FormattedMessage id="globalNavigation.leaders" />,
        });
    }
}

export default withHeader(LeadersSectionContainer);

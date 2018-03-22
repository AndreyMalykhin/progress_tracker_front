import { HeaderAnimation } from "components/header";
import LeadersSection from "components/leaders-section";
import { INavBarItem } from "components/nav-bar";
import withHeader, { IWithHeaderProps } from "components/with-header";
import Audience from "models/audience";
import * as React from "react";
import { compose } from "react-apollo";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import { RouteComponentProps } from "react-router";
import Analytics from "utils/analytics";
import AnalyticsEvent from "utils/analytics-event";
import makeLog from "utils/make-log";
import routes from "utils/routes";

interface IRouteParams {
    audience: Audience;
}

interface ILeadersSectionContainerProps extends
    IWithHeaderProps, RouteComponentProps<IRouteParams>, InjectedIntlProps {}

const log = makeLog("leaders-section-container");

const friendsAudienceRoute =
    routes.leaders.path.replace(":audience", Audience.Friends);
const globalAudienceRoute =
    routes.leaders.path.replace(":audience", Audience.Global);
const navItems: INavBarItem[] = [
    {
        matchExact: routes.leaders.exact,
        matchPath: globalAudienceRoute,
        navigateToPath: globalAudienceRoute,
        onPreSelect: () => Analytics.log(
            AnalyticsEvent.LeadersPageOpenGlobalChart),
        titleMsgId: "leadersNavigation.global",
    },
    {
        matchExact: routes.leaders.exact,
        matchPath: friendsAudienceRoute,
        navigateToPath: friendsAudienceRoute,
        onPreSelect: () => Analytics.log(
            AnalyticsEvent.LeadersPageOpenFriendsChart),
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
        this.updateHeader(this.props);
    }

    public componentWillReceiveProps(
        nextProps: ILeadersSectionContainerProps,
    ) {
        if (nextProps.header.isEmpty()) {
            this.updateHeader(nextProps);
        }
    }

    private updateHeader(props: ILeadersSectionContainerProps) {
        const title = props.intl.formatMessage(
            { id: "globalNavigation.leaders" });
        props.header.replace({
            animation: HeaderAnimation.FadeInRight,
            key: "leadersSectionContainer.index",
            title,
        });
    }
}

export default compose(withHeader, injectIntl)(LeadersSectionContainer);

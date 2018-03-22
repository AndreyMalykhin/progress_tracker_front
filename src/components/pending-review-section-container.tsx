import { HeaderAnimation } from "components/header";
import { INavBarItem } from "components/nav-bar";
import PendingReviewSection from "components/pending-review-section";
import withHeader, { IWithHeaderProps } from "components/with-header";
import Audience from "models/audience";
import * as React from "react";
import { compose } from "react-apollo";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";
import Analytics from "utils/analytics";
import AnalyticsEvent from "utils/analytics-event";
import makeLog from "utils/make-log";
import routes from "utils/routes";

interface IRouteParams {
    audience: Audience;
}

interface IPendingReviewSectionContainerProps extends
    IWithHeaderProps, RouteComponentProps<IRouteParams>, InjectedIntlProps {}

const log = makeLog("pending-review-section-container");

const globalAudienceRoute =
    routes.pendingReview.path.replace(":audience", Audience.Global);
const friendsAudienceRoute =
    routes.pendingReview.path.replace(":audience", Audience.Friends);
const myAudienceRoute =
    routes.pendingReview.path.replace(":audience", Audience.Me);
const navItems: INavBarItem[] = [
    {
        matchExact: routes.pendingReview.exact,
        matchPath: globalAudienceRoute,
        navigateToPath: globalAudienceRoute,
        onPreSelect: () => Analytics.log(
            AnalyticsEvent.PendingReviewPageOpenGlobalTrackables),
        titleMsgId: "reviewsNavigation.globalTrackables",
    },
    {
        matchExact: routes.pendingReview.exact,
        matchPath: friendsAudienceRoute,
        navigateToPath: friendsAudienceRoute,
        onPreSelect: () => Analytics.log(
            AnalyticsEvent.PendingReviewPageOpenFriendsTrackables),
        titleMsgId: "reviewsNavigation.friendsTrackables",
    },
    {
        matchExact: routes.pendingReview.exact,
        matchPath: myAudienceRoute,
        navigateToPath: myAudienceRoute,
        onPreSelect: () => Analytics.log(
            AnalyticsEvent.PendingReviewPageOpenMyTrackables),
        titleMsgId: "reviewsNavigation.myTrackables",
    },
];

class PendingReviewSectionContainer extends
    React.Component<IPendingReviewSectionContainerProps> {

    public render() {
        return (
            <PendingReviewSection
                audience={this.props.match.params.audience}
                navItems={navItems}
            />
        );
    }

    public componentWillMount() {
        this.updateHeader(this.props);
    }

    public componentWillReceiveProps(
        nextProps: IPendingReviewSectionContainerProps,
    ) {
        if (nextProps.header.isEmpty()) {
            this.updateHeader(nextProps);
        }
    }

    private updateHeader(props: IPendingReviewSectionContainerProps) {
        const title = props.intl.formatMessage(
            { id: "globalNavigation.pendingReview" });
        props.header.replace({
            animation: HeaderAnimation.FadeInRight,
            key: "pendingReviewSectionContainer.index",
            title,
        });
    }
}

export default compose(withRouter, withHeader, injectIntl)(
    PendingReviewSectionContainer);

import { INavBarItem } from "components/nav-bar";
import PendingReviewSection from "components/pending-review-section";
import withHeader, { IWithHeaderProps } from "components/with-header";
import Audience from "models/audience";
import * as React from "react";
import { compose } from "react-apollo";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";
import routes from "utils/routes";

interface IRouteParams {
    audience: Audience;
}

interface IPendingReviewSectionContainerProps extends
    IWithHeaderProps, RouteComponentProps<IRouteParams>, InjectedIntlProps {}

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
        titleMsgId: "reviewsNavigation.globalTrackables",
    },
    {
        matchExact: routes.pendingReview.exact,
        matchPath: friendsAudienceRoute,
        navigateToPath: friendsAudienceRoute,
        titleMsgId: "reviewsNavigation.friendsTrackables",
    },
    {
        matchExact: routes.pendingReview.exact,
        matchPath: myAudienceRoute,
        navigateToPath: myAudienceRoute,
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
        this.updateHeader();
    }

    public componentWillReceiveProps(
        nextProps: IPendingReviewSectionContainerProps,
    ) {
        if (nextProps.header.isEmpty()) {
            this.updateHeader();
        }
    }

    private updateHeader() {
        const title = this.props.intl.formatMessage(
            { id: "globalNavigation.pendingReview" });
        this.props.header.replace({ title });
    }
}

export default compose(withRouter, withHeader, injectIntl)(
    PendingReviewSectionContainer);

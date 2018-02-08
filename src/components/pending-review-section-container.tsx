import PendingReviewSection, {
    IPendingReviewSectionNavItem,
} from "components/pending-review-section";
import PendingReviewTrackableListContainer from "components/pending-review-trackable-list-container";
import withHeader, { IWithHeaderProps } from "components/with-header";
import Audience from "models/audience";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import routes from "utils/routes";

type IPendingReviewSectionContainerProps = IWithHeaderProps;

class PendingReviewSectionContainer extends
    React.Component<IPendingReviewSectionContainerProps> {
    private navItems: IPendingReviewSectionNavItem[];

    public constructor(
        props: IPendingReviewSectionContainerProps, context: any,
    ) {
        super(props, context);
        this.navItems = [
            {
                matchExact: routes.reviewsGlobal.exact,
                matchPath: routes.reviewsGlobal.path,
                navigateToPath: routes.reviewsGlobal.path,
                render: () => this.renderList(Audience.Global),
                titleMsgId: "reviewsNavigation.globalTrackables",
            },
            {
                matchExact: routes.reviewsFriends.exact,
                matchPath: routes.reviewsFriends.path,
                navigateToPath: routes.reviewsFriends.path,
                render: () => this.renderList(Audience.Friends),
                titleMsgId: "reviewsNavigation.friendTrackables",
            },
            {
                matchExact: routes.reviewsMy.exact,
                matchPath: routes.reviewsMy.path,
                navigateToPath: routes.reviewsMy.path,
                render: () => this.renderList(Audience.Me),
                titleMsgId: "reviewsNavigation.myTrackables",
            },
        ];
    }

    public render() {
        return <PendingReviewSection navItems={this.navItems} />;
    }

    public componentWillMount() {
        this.props.header.replace({
            hideBackCommand: true,
            title: <FormattedMessage id="globalNavigation.pendingReview" />,
        });
    }

    private renderList(audience: Audience) {
        return <PendingReviewTrackableListContainer audience={audience} />;
    }
}

export default withHeader(PendingReviewSectionContainer);

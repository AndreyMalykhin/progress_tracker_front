import ArchiveSection from "components/archive-section";
import { INavBarItem } from "components/nav-bar";
import withSession, { IWithSessionProps } from "components/with-session";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { compose } from "react-apollo";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router";
import defaultId from "utils/default-id";
import routes from "utils/routes";

interface IRouteParams {
    id: string;
    trackableStatus: TrackableStatus;
}

interface IArchiveSectionContainerProps extends
    RouteComponentProps<IRouteParams> {}

const approvedTrackablesRoute = routes.profileArchive.path.replace(
    ":trackableStatus", TrackableStatus.Approved);
const rejectedTrackablesRoute = routes.profileArchive.path.replace(
    ":trackableStatus", TrackableStatus.Rejected);
const expiredTrackablesRoute = routes.profileArchive.path.replace(
    ":trackableStatus", TrackableStatus.Expired);

class ArchiveSectionContainer extends
    React.Component<IArchiveSectionContainerProps> {
    private navItems: INavBarItem[] = [];

    public constructor(props: IArchiveSectionContainerProps, context: any) {
        super(props, context);
        this.initNavItems(props.match.params.id);
    }

    public render() {
        const { match } = this.props;
        const { id, trackableStatus } = match.params;
        return (
            <ArchiveSection
                userId={id}
                navItems={this.navItems}
                trackableStatus={trackableStatus}
            />
        );
    }

    public componentWillReceiveProps(nextProps: IArchiveSectionContainerProps) {
        const nextUserId = nextProps.match.params.id;

        if (this.props.match.params.id !== nextUserId) {
            this.initNavItems(nextUserId);
        }
    }

    private initNavItems(userId: string) {
        this.navItems = [
            {
                matchExact: routes.profileArchive.exact,
                matchPath: approvedTrackablesRoute,
                navigateToPath: approvedTrackablesRoute.replace(":id", userId),
                titleMsgId: "archiveNavigation.approvedTrackables",
            },
            {
                matchExact: routes.profileArchive.exact,
                matchPath: rejectedTrackablesRoute,
                navigateToPath: rejectedTrackablesRoute.replace(":id", userId),
                titleMsgId: "archiveNavigation.rejectedTrackables",
            },
            {
                matchExact: routes.profileArchive.exact,
                matchPath: expiredTrackablesRoute,
                navigateToPath: expiredTrackablesRoute.replace(":id", userId),
                titleMsgId: "archiveNavigation.expiredTrackables",
            },
        ];
    }
}

export default compose(withRouter)(ArchiveSectionContainer);

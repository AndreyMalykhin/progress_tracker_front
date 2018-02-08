import Archive, { IArchiveNavItem } from "components/archive";
import ArchivedTrackableListContainer from "components/archived-trackable-list-container";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router";
import myId from "utils/my-id";
import routes from "utils/routes";

interface IRouteParams {
    id: string;
}

type IArchiveContainerProps = RouteComponentProps<IRouteParams>;

class ArchiveContainer extends React.Component<IArchiveContainerProps> {
    private navItems: IArchiveNavItem[];

    public constructor(props: IArchiveContainerProps, context: any) {
        super(props, context);
        this.initNavItems(props.match.params.id);
    }

    public render() {
        return <Archive navItems={this.navItems} />;
    }

    public componentWillReceiveProps(nextProps: IArchiveContainerProps) {
        const nextUserId = nextProps.match.params.id;

        if (this.props.match.params.id !== nextUserId) {
            this.initNavItems(nextUserId);
        }
    }

    private initNavItems(userId: string) {
        this.navItems = [
            {
                matchExact: routes.profileArchiveApprovedTrackables.exact,
                matchPath: routes.profileArchiveApprovedTrackables.path,
                navigateToPath: routes.profileArchiveApprovedTrackables.path
                    .replace(":id", userId),
                render: () => this.renderList(userId, TrackableStatus.Approved),
                titleMsgId: "archiveNavigation.approvedTrackables",
            },
            {
                matchExact: routes.profileArchiveRejectedTrackables.exact,
                matchPath: routes.profileArchiveRejectedTrackables.path,
                navigateToPath: routes.profileArchiveRejectedTrackables.path
                    .replace(":id", userId),
                render: () => this.renderList(userId, TrackableStatus.Rejected),
                titleMsgId: "archiveNavigation.rejectedTrackables",
            },
            {
                matchExact: routes.profileArchiveExpiredTrackables.exact,
                matchPath: routes.profileArchiveExpiredTrackables.path,
                navigateToPath: routes.profileArchiveExpiredTrackables.path
                    .replace(":id", userId),
                render: () => this.renderList(userId, TrackableStatus.Expired),
                titleMsgId: "archiveNavigation.expiredTrackables",
            },
        ];
    }

    private renderList(userId: string, trackableStatus: TrackableStatus) {
        return (
            <ArchivedTrackableListContainer
                userId={userId}
                trackableStatus={trackableStatus}
            />
        );
    }
}

export default withRouter(ArchiveContainer);

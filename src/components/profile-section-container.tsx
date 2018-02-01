import {
    IReportUserResponse,
    reportUser,
    reportUserQuery,
} from "actions/report-user-action";
import ActionSheet, { IActionSheetOption } from "components/action-sheet";
import ActiveTrackableListContainer from "components/active-trackable-list-container";
import ArchivedTrackables from "components/archived-trackables";
import Error from "components/error";
import {
    HeaderSubtitle,
    HeaderTitle,
    IHeaderCmd,
    IHeaderState,
} from "components/header";
import Loader from "components/loader";
import ProfileSection, {
    IProfileSectionNavItem, IProfileSectionProps,
} from "components/profile-section";
import gql from "graphql-tag";
import ReportReason from "models/report-reason";
import TrackableType from "models/trackable-type";
import Type from "models/type";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { InjectedIntlProps, injectIntl } from "react-intl";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteComponentProps, withRouter } from "react-router";
import myId from "utils/my-id";
import QueryStatus, { isLoading } from "utils/query-status";
import routes from "utils/routes";
import withError from "utils/with-error";
import withLoader from "utils/with-loader";

type IProfileSectionContainerProps =
    RouteComponentProps<IRouteParams>
    & InjectedIntlProps
    & {
    data: QueryProps & IGetDataResponse;
    onCommitReportUser: (id: string, reportReason: ReportReason) => void;
};

interface IGetDataResponse {
    getUserById: {
        id: string;
        name: string;
        rating: number;
        avatarUrlSmall: string;
        isReported: boolean;
    };
}

interface IRouteParams {
    id: string;
}

type IOwnProps = RouteComponentProps<IRouteParams>;

const withReportUser =
    graphql<IReportUserResponse, IOwnProps, IProfileSectionContainerProps>(
        reportUserQuery,
        {
            props: ({ mutate }) => {
                return {
                    onCommitReportUser: (id: string, reason: ReportReason) =>
                        reportUser(id, reason, mutate!),
                };
            },
        },
    );

const getDataQuery = gql`
query GetDataQuery($userId: ID!) {
    getUserById(id: $userId) {
        id
        name
        rating
        avatarUrlSmall
        isReported
    }
}`;

const withData =
    graphql<IGetDataResponse, IOwnProps, IProfileSectionContainerProps>(
        getDataQuery,
        {
            options: (ownProps) => {
                return {
                    notifyOnNetworkStatusChange: true,
                    variables: { userId: ownProps.match.params.id },
                };
            },
            props: ({ ownProps, data }) => {
                const queryStatus = data!.networkStatus;

                if (queryStatus === QueryStatus.InitialLoading
                    || queryStatus === QueryStatus.Error
                ) {
                    return { queryStatus };
                }

                return { data, queryStatus };
            },
        },
    );

const reportReasons: Array< IActionSheetOption<ReportReason> > = [
    {
        id: ReportReason.Abuse,
        msgId: "reasons.abuse",
    },
    {
        id: ReportReason.Cheating,
        msgId: "reasons.cheating",
    },
    {
        id: ReportReason.Spam,
        msgId: "reasons.spam",
    },
];

const trackableTypes: Array< IActionSheetOption<Type> > = [
    {
        id: Type.Counter,
        msgId: "trackableTypes.counter",
    },
    {
        id: Type.GymExercise,
        msgId: "trackableTypes.gymExercise",
    },
    {
        id: Type.NumericalGoal,
        msgId: "trackableTypes.numericalGoal",
    },
    {
        id: Type.TaskGoal,
        msgId: "trackableTypes.taskGoal",
    },
];

class ProfileSectionContainer
    extends React.Component<IProfileSectionContainerProps> {
    private navItems: IProfileSectionNavItem[] = [
        {
            component: ActiveTrackableListContainer,
            iconName: "format-list-checks",
            matchExact: routes.profileActiveTrackables.exact,
            matchPath: routes.profileActiveTrackables.path,
            navigateToPath: routes.profileMyActiveTrackables.path,
            titleMsgId: "profile.activeTrackables",
        },
        {
            component: ArchivedTrackables,
            iconName: "archive",
            matchExact: routes.profileArchive.exact,
            matchPath: routes.profileArchive.path,
            navigateToPath: routes.profileMyArchive.path,
            titleMsgId: "profile.archive",
        },
    ];

    public render() {
        return <ProfileSection navItems={this.navItems} />;
    }

    public componentWillReceiveProps(nextProps: IProfileSectionContainerProps) {
        const nextUser = nextProps.data.getUserById;
        const prevUser = this.props.data.getUserById;
        const nextUserId = nextUser.id;

        if (prevUser.id !== nextUserId) {
            this.navItems = this.navItems.map((navItem) => {
                return {
                    ...navItem,
                    navigateToPath:
                        navItem.matchPath.replace(":id", nextUserId),
                };
            });
        }

        if (prevUser.id !== nextUserId
            || prevUser.rating !== nextUser.rating
            || prevUser.name !== nextUser.name
        ) {
            this.updateHeader();
        }
    }

    public componentWillMount() {
        this.updateHeader();
    }

    private updateHeader() {
        const { data, history } = this.props;
        const { getUserById: user, networkStatus } = data;

        if (isLoading(networkStatus)) {
            history.replace({ state: null });
            return;
        }

        const isMe = user.id === myId;
        const subtitle = (
            <HeaderSubtitle>
                <Icon name="star-circle" />{user.rating}
            </HeaderSubtitle>
        );
        const profileCmd = {
            imgUrl: user.avatarUrlSmall,
            msgId: isMe ? "commands.edit" : "commands.profile",
            onRun: this.onEditProfile,
        } as IHeaderCmd;
        const rightCommands: IHeaderCmd[] = [];

        if (isMe) {
            const newTrackableCmd = {
                iconName: "plus",
                msgId: "commands.new",
                onRun: this.onStartNewTrackable,
            } as IHeaderCmd;
            rightCommands.push(newTrackableCmd);
        } else if (!user.isReported) {
            const reportCmd = {
                iconName: "exclamation",
                msgId: "commands.report",
                onRun: this.onStartReportUser,
            } as IHeaderCmd;
            rightCommands.push(reportCmd);
        }

        history.replace({
            state: {
                hideBackCommand: true,
                leftCommand: profileCmd,
                rightCommands,
                subtitle,
                title: <HeaderTitle>{user.name}</HeaderTitle>,
            } as IHeaderState,
        });
    }

    private onEditProfile = () => {
        const { data, history } = this.props;

        if (data.getUserById.id !== myId) {
            return;
        }

        history.push(routes.profileEdit.path);
    }

    private onStartReportUser = () => {
        ActionSheet.open({
            onClose: this.onCommitReportUser,
            options: reportReasons,
            titleMsgId: "reportUser.title",
            translator: this.props.intl,
        });
    }

    private onCommitReportUser = (reportReason?: ReportReason) => {
        if (reportReason == null) {
            return;
        }

        this.props.onCommitReportUser(
            this.props.data.getUserById.id, reportReason);
    }

    private onStartNewTrackable = () => {
        ActionSheet.open({
            onClose: this.onCommitNewTrackable,
            options: trackableTypes,
            titleMsgId: "newTrackable.title",
            translator: this.props.intl,
        });
    }

    private onCommitNewTrackable = (type?: Type) => {
        if (type == null) {
            return;
        }

        this.props.history.push(routes.trackableNew.path.replace(
            ":type", type.toString()));
    }
}

export default compose(
    withRouter,
    withData,
    withLoader(Loader),
    withError(Error),
    withReportUser,
    injectIntl,
)(ProfileSectionContainer);

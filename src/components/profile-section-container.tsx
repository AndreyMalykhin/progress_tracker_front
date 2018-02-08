import {
    IReportUserResponse,
    reportUser,
    reportUserQuery,
} from "actions/report-user-action";
import ActionSheet, { IActionSheetOption } from "components/action-sheet";
import ActiveTrackableListContainer from "components/active-trackable-list-container";
import ArchiveContainer from "components/archive-container";
import Error from "components/error";
import {
    IHeaderCmd,
    IHeaderState,
} from "components/header";
import Loader from "components/loader";
import ProfileSection, {
    IProfileSectionNavItem, IProfileSectionProps,
} from "components/profile-section";
import withError from "components/with-error";
import withHeader, { IWithHeaderProps } from "components/with-header";
import withLoader from "components/with-loader";
import gql from "graphql-tag";
import ReportReason from "models/report-reason";
import TrackableStatus from "models/trackable-status";
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

type IProfileSectionContainerProps =
    RouteComponentProps<IRouteParams>
    & InjectedIntlProps
    & IWithHeaderProps
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
query GetData($userId: ID!) {
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
    {
        id: ReportReason.Other,
        msgId: "reasons.other",
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
    private navItems: IProfileSectionNavItem[];

    public constructor(props: IProfileSectionContainerProps, context: any) {
        super(props, context);
        this.initNavItems(props.data.getUserById.id);
        this.updateHeader(props);
    }

    public render() {
        return <ProfileSection navItems={this.navItems} />;
    }

    public componentWillReceiveProps(nextProps: IProfileSectionContainerProps) {
        const nextUser = nextProps.data.getUserById;
        const prevUser = this.props.data.getUserById;
        const nextUserId = nextUser.id;

        if (prevUser.id !== nextUserId) {
            this.initNavItems(nextUserId);
        }

        if (prevUser.id !== nextUserId
            || prevUser.rating !== nextUser.rating
            || prevUser.name !== nextUser.name
            || prevUser.isReported !== nextUser.isReported
        ) {
            this.updateHeader(nextProps);
        }
    }

    private initNavItems(userId: string) {
        this.navItems = [
            {
                component: ActiveTrackableListContainer,
                iconName: "format-list-checks",
                matchExact: routes.profileActiveTrackables.exact,
                matchPath: routes.profileActiveTrackables.path,
                navigateToPath: routes.profileActiveTrackables.path.replace(
                    ":id", userId),
                titleMsgId: "profile.activeTrackables",
            },
            {
                component: ArchiveContainer,
                iconName: "archive",
                matchExact: routes.profileArchive.exact,
                matchPath: routes.profileArchive.path,
                navigateToPath: routes.profileArchiveApprovedTrackables.path
                    .replace(":id", userId),
                titleMsgId: "profile.archive",
            },
        ];
    }

    private updateHeader(props: IProfileSectionContainerProps) {
        const { data, header } = props;
        const { getUserById: user } = data;
        const isMe = user.id === myId;
        const rightCommands: IHeaderCmd[] = [];

        if (isMe) {
            rightCommands.push({
                iconName: "plus",
                msgId: "commands.new",
                onRun: this.onStartNewTrackable,
            });
        } else if (!user.isReported) {
            rightCommands.push({
                iconName: "exclamation",
                msgId: "commands.report",
                onRun: this.onStartReportUser,
            });
        }

        const leftCommand = {
            imgUrl: user.avatarUrlSmall,
            msgId: isMe ? "commands.edit" : "commands.profile",
            onRun: this.onEditProfile,
        };
        header.replace({
            hideBackCommand: true,
            leftCommand,
            rightCommands,
            subtitleIcon: "star-circle",
            subtitleText: user.rating,
            title: user.name,
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
        // TODO toast
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
    withHeader,
)(ProfileSectionContainer);

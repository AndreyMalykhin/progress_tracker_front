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
import withNoUpdatesInBackground from "components/with-no-updates-in-background";
import withSession, { IWithSessionProps } from "components/with-session";
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
import defaultId from "utils/default-id";
import IconName from "utils/icon-name";
import QueryStatus, { isLoading } from "utils/query-status";
import routes from "utils/routes";

interface IProfileSectionContainerProps extends
    IOwnProps,
    InjectedIntlProps,
    IWithHeaderProps {
    remoteData: QueryProps & IGetRemoteDataResponse;
    localData: QueryProps & IGetLocalDataResponse;
    onCommitReportUser: (id: string, reportReason: ReportReason) => void;
}

interface IOwnProps extends
    RouteComponentProps<IRouteParams>, IWithSessionProps {}

interface IGetRemoteDataResponse {
    getUserById: {
        id: string;
        name: string;
        rating: number;
        avatarUrlSmall: string;
        isReported: boolean;
    };
}

interface IGetLocalDataResponse {
    ui: {
        isContextMode: boolean;
    };
}

interface IRouteParams {
    id?: string;
}

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

const getRemoteDataQuery = gql`
query GetData($userId: ID!) {
    getUserById(id: $userId) {
        id
        name
        rating
        avatarUrlSmall
        isReported
    }
}`;

const getLocalDataQuery = gql`
query GetData {
    ui @client {
        id
        isContextMode
    }
}`;

const withLocalData = graphql<
    IGetLocalDataResponse,
    IOwnProps,
    IProfileSectionContainerProps
>(
    getLocalDataQuery,
    {
        props: ({ data }) => {
            return { localData: data };
        },
    },
);

const withRemoteData =
    graphql<IGetRemoteDataResponse, IOwnProps, IProfileSectionContainerProps>(
        getRemoteDataQuery,
        {
            options: (ownProps) => {
                const { match, session } = ownProps;
                let userId = match.params.id;

                if (!userId || userId === defaultId) {
                    userId = session.userId;
                }

                return {
                    notifyOnNetworkStatusChange: true,
                    variables: { userId },
                };
            },
            props: ({ ownProps, data }) => {
                const queryStatus = data!.networkStatus;

                if (queryStatus === QueryStatus.InitialLoading
                    || queryStatus === QueryStatus.Error
                ) {
                    return { queryStatus };
                }

                return { remoteData: data, queryStatus };
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
    private navItems: IProfileSectionNavItem[] = [];

    public constructor(props: IProfileSectionContainerProps, context: any) {
        super(props, context);
        this.initNavItems(props.match.params.id);
        this.updateHeader(props);
    }

    public render() {
        return (
            <ProfileSection
                navItems={this.navItems}
                isContextMode={this.props.localData.ui.isContextMode}
            />
        );
    }

    public componentWillReceiveProps(nextProps: IProfileSectionContainerProps) {
        const nextUser = nextProps.remoteData.getUserById;
        const prevUser = this.props.remoteData.getUserById;

        if (this.props.match.params.id !== nextProps.match.params.id) {
            this.initNavItems(nextProps.match.params.id);
        }

        if (prevUser.id !== nextUser.id
            || prevUser.rating !== nextUser.rating
            || prevUser.name !== nextUser.name
            || prevUser.isReported !== nextUser.isReported
        ) {
            this.updateHeader(nextProps);
        }
    }

    private initNavItems(userId?: string) {
        this.navItems = [
            {
                component: ActiveTrackableListContainer,
                iconName: IconName.InProgress,
                matchExact: routes.profileActiveTrackables.exact,
                matchPath: routes.profileActiveTrackables.path,
                navigateToPath: routes.profileActiveTrackables.path.replace(
                    ":id", userId || defaultId),
                titleMsgId: "profile.activeTrackables",
            },
            {
                component: ArchiveContainer,
                iconName: IconName.Archive,
                matchExact: routes.profileArchive.exact,
                matchPath: routes.profileArchive.path,
                navigateToPath: routes.profileArchive.path
                    .replace(":id", userId || defaultId)
                    .replace(":trackableStatus", TrackableStatus.Approved),
                titleMsgId: "profile.archive",
            },
        ];
    }

    private updateHeader(props: IProfileSectionContainerProps) {
        const { remoteData, header, session } = props;
        const user = remoteData.getUserById;
        const isMe = user.id === session.userId;
        const rightCommands: IHeaderCmd[] = [];

        if (isMe) {
            rightCommands.push({
                iconName: IconName.Add,
                msgId: "commands.new",
                onRun: this.onStartNewTrackable,
            });
        } else if (!user.isReported) {
            rightCommands.push({
                iconName: IconName.Report,
                msgId: "commands.report",
                onRun: this.onStartReportUser,
            });
        }

        const leftCommand = {
            imgUrl: user.avatarUrlSmall,
            msgId: isMe ? "commands.edit" : "commands.profile",
            onRun: isMe ? this.onEditProfile : undefined,
        };
        header.replace({
            leftCommand,
            rightCommands,
            subtitleIcon: "star-circle",
            subtitleText: user.rating,
            title: user.name,
        });
    }

    private onEditProfile = () =>
        this.props.history.push(routes.profileEdit.path)

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
            this.props.remoteData.getUserById.id, reportReason);
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
    withHeader,
    withSession,
    withLocalData,
    withRemoteData,
    withNoUpdatesInBackground,
    withLoader(Loader),
    withError(Error),
    withReportUser,
    injectIntl,
)(ProfileSectionContainer);

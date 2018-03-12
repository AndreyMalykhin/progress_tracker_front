import {
    IReportUserResponse,
    reportUser,
    reportUserQuery,
} from "actions/report-user-action";
import { addToast } from "actions/toast-helpers";
import ActionSheet, { IActionSheetOption } from "components/action-sheet";
import ActiveTrackableListContainer from "components/active-trackable-list-container";
import ArchiveSectionContainer from "components/archive-section-container";
import Error from "components/error";
import {
    IHeaderCmd,
    IHeaderState,
} from "components/header";
import Loader from "components/loader";
import Offline from "components/offline";
import ProfileSection, {
    IProfileSectionNavItem, IProfileSectionProps,
} from "components/profile-section";
import { ToastSeverity } from "components/toast";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import withError from "components/with-error";
import withFetchPolicy, {
    IWithFetchPolicyProps,
} from "components/with-fetch-policy";
import withHeader, { IWithHeaderProps } from "components/with-header";
import withLoader from "components/with-loader";
import withNetworkStatus, {
    IWithNetworkStatusProps,
} from "components/with-network-status";
import withNoUpdatesInBackground from "components/with-no-updates-in-background";
import withSession, { IWithSessionProps } from "components/with-session";
import withSyncStatus, {
    IWithSyncStatusProps,
} from "components/with-sync-status";
import gql from "graphql-tag";
import ReportReason from "models/report-reason";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import * as React from "react";
import { compose, withApollo } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";
import defaultId from "utils/default-id";
import getDataOrQueryStatus from "utils/get-data-or-query-status";
import IconName from "utils/icon-name";
import { IWithApolloProps } from "utils/interfaces";
import isMyId from "utils/is-my-id";
import makeLog from "utils/make-log";
import QueryStatus, { isLoading } from "utils/query-status";
import routes from "utils/routes";
import Sound from "utils/sound";

interface IProfileSectionContainerProps extends
    IOwnProps,
    InjectedIntlProps,
    IWithSyncStatusProps,
    IWithDIContainerProps,
    IWithHeaderProps {
    remoteData: QueryProps & IGetRemoteDataResponse;
    localData: QueryProps & IGetLocalDataResponse;
    onCommitReportUser: (id: string, reportReason: ReportReason) =>
        Promise<any>;
}

interface IOwnProps extends
    RouteComponentProps<IRouteParams>,
    IWithSessionProps,
    IWithApolloProps,
    IWithNetworkStatusProps,
    IWithFetchPolicyProps {}

interface IGetRemoteDataResponse {
    getUser: {
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

const log = makeLog("profile-section-container");

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
query GetData($userId: ID) {
    getUser(id: $userId) {
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
        options: { fetchPolicy: "cache-only" },
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
                const { fetchPolicy, match, session } = ownProps;
                let userId = match.params.id;

                if (!userId
                    || userId === defaultId
                    || userId === session.userId
                ) {
                    userId = undefined;
                }

                return {
                    fetchPolicy,
                    notifyOnNetworkStatusChange: true,
                    variables: { userId },
                };
            },
            props: ({ data }) => {
                return { remoteData: data};
            },
            skip: (ownProps: IOwnProps) => !ownProps.session.userId,
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

    public componentWillMount() {
        log.trace("componentWillMount()");
    }

    public componentWillReceiveProps(nextProps: IProfileSectionContainerProps) {
        if (this.props.match.params.id !== nextProps.match.params.id) {
            this.initNavItems(nextProps.match.params.id);
        }

        const nextUser = nextProps.remoteData.getUser;
        const prevUser = this.props.remoteData.getUser;

        if (prevUser === nextUser) {
            return;
        }

        if (prevUser.id !== nextUser.id
            || prevUser.rating !== nextUser.rating
            || prevUser.name !== nextUser.name
            || prevUser.isReported !== nextUser.isReported
            || this.props.session.accessToken !== nextProps.session.accessToken
        ) {
            this.updateHeader(nextProps);
        }
    }

    public componentWillUnmount() {
        log.trace("componentWillUnmount()");
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
                component: ArchiveSectionContainer,
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
        const { remoteData, header, session, match } = props;
        const user = remoteData.getUser;
        const isMe = !match.params.id
            || match.params.id === defaultId
            || match.params.id === session.userId
            || (user && user.id === session.userId);
        const rightCommands: IHeaderCmd[] = [];

        if (isMe) {
            rightCommands.push({
                iconName: IconName.Add,
                msgId: "commands.new",
                onRun: this.onStartNewTrackable,
            });
        } else if (user && !user.isReported) {
            rightCommands.push({
                iconName: IconName.Report,
                isDisabled: !session.accessToken,
                msgId: "commands.report",
                onRun: this.onStartReportUser,
            });
        }

        const leftCommand = user && {
            imgUrl: user.avatarUrlSmall,
            msgId: isMe ? "commands.edit" : "commands.profile",
            onRun: isMe ? this.onEditProfile : undefined,
        };
        header.replace({
            leftCommand,
            rightCommands,
            subtitleIcon: user && "star-circle",
            subtitleText: user && user.rating,
            title: user && user.name,
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

    private onCommitReportUser = async (reportReason?: ReportReason) => {
        if (reportReason == null) {
            return;
        }

        const { onCommitReportUser, remoteData, intl, diContainer, client } =
            this.props;

        try {
            await onCommitReportUser(remoteData.getUser.id, reportReason);
        } catch (e) {
            return;
        }

        const msg = intl.formatMessage({ id: "notifications.userReported" });
        addToast(
            { severity: ToastSeverity.Info, msg, sound: Sound.Reject }, client);
    }

    private onStartNewTrackable = () => {
        ActionSheet.open({
            onClose: this.onCommitNewTrackable,
            options: trackableTypes,
            titleMsgId: "addTrackable.title",
            translator: this.props.intl,
        });
    }

    private onCommitNewTrackable = (type?: Type) => {
        if (type == null) {
            return;
        }

        this.props.history.push(routes.trackableAdd.path.replace(
            ":type", type.toString()));
    }
}

export default compose(
    withRouter,
    withDIContainer,
    withHeader,
    withSession,
    withLocalData,
    withNetworkStatus,
    withSyncStatus,
    withFetchPolicy<IProfileSectionContainerProps>({
        getNamespace: (props) => props.match.params.id,
        isMyData: (props) => isMyId(props.match.params.id, props.session),
        isReadonlyData: () => false,
    }),
    withRemoteData,
    withNoUpdatesInBackground,
    withLoader<IProfileSectionContainerProps, IGetRemoteDataResponse>(Loader, {
        dataField: "getUser",
        getQuery: (props) => props.remoteData,
    }),
    withError<IProfileSectionContainerProps, IGetRemoteDataResponse>(Error, {
        dataField: "getUser",
        getQuery: (props) => props.remoteData,
    }),
    withApollo,
    withReportUser,
    injectIntl,
)(ProfileSectionContainer);

import {
    approveTrackable,
    approveTrackableQuery,
    IApproveTrackableResponse,
} from "actions/approve-trackable-action";
import {
    IRejectTrackableResponse,
    rejectTrackable,
    rejectTrackableQuery,
} from "actions/reject-trackable-action";
import { addGenericErrorToast, addToast } from "actions/toast-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import ActionSheet, { IActionSheetOption } from "components/action-sheet";
import EmptyList from "components/empty-list";
import Error from "components/error";
import Loader from "components/loader";
import Offline from "components/offline";
import PendingReviewTrackableList, {
    IPendingReviewTrackableListItemNode,
} from "components/pending-review-trackable-list";
import {
    IStackingSwitchHistoryState,
    StackingSwitchAnimation,
} from "components/stacking-switch";
import { ToastSeverity } from "components/toast";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import withEmptyList from "components/with-empty-list";
import withEnsureUserLoggedIn, {
    IWithEnsureUserLoggedInProps,
} from "components/with-ensure-user-logged-in";
import withError from "components/with-error";
import withFetchPolicy, {
    IWithFetchPolicyProps,
} from "components/with-fetch-policy";
import withLoadMore, { IWithLoadMoreProps } from "components/with-load-more";
import withLoader from "components/with-loader";
import withLogin from "components/with-login";
import withLoginAction, {
    IWithLoginActionProps,
} from "components/with-login-action";
import withNetworkStatus, {
    IWithNetworkStatusProps,
} from "components/with-network-status";
import withNoUpdatesInBackground from "components/with-no-updates-in-background";
import withOffline from "components/with-offline";
import withRefresh, { IWithRefreshProps } from "components/with-refresh";
import withSession, { IWithSessionProps } from "components/with-session";
import withSyncStatus, {
    IWithSyncStatusProps,
} from "components/with-sync-status";
import gql from "graphql-tag";
import Audience from "models/audience";
import Difficulty from "models/difficulty";
import RejectReason from "models/reject-reason";
import ReviewStatus from "models/review-status";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { withApollo } from "react-apollo/withApollo";
import {
    FormattedMessage,
    InjectedIntlProps,
    injectIntl,
    MessageValue,
} from "react-intl";
import { Alert, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { RouteComponentProps, withRouter } from "react-router";
import Analytics from "utils/analytics";
import AnalyticsContext from "utils/analytics-context";
import AnalyticsEvent from "utils/analytics-event";
import { IConnection } from "utils/connection";
import defaultId from "utils/default-id";
import { push, removeIndex } from "utils/immutable-utils";
import { IWithApolloProps } from "utils/interfaces";
import makeLog from "utils/make-log";
import QueryStatus from "utils/query-status";
import routes from "utils/routes";
import Sound from "utils/sound";

interface IPendingReviewTrackableListContainerProps extends
    IOwnProps,
    InjectedIntlProps,
    IWithEnsureUserLoggedInProps,
    IWithLoginActionProps,
    IWithRefreshProps,
    IWithDIContainerProps,
    IWithLoadMoreProps {
    data: QueryProps & IGetDataResponse;
    onCommitApproveItem: (id: string, difficulty: Difficulty) =>
        Promise<IApproveTrackableResponse>;
    onCommitRejectItem: (id: string, reason: RejectReason) =>
        Promise<IRejectTrackableResponse>;
}

interface IOwnProps extends
    RouteComponentProps<{}>,
    IWithApolloProps,
    IWithFetchPolicyProps,
    IWithSessionProps,
    IWithNetworkStatusProps,
    IWithSyncStatusProps {
    audience: Audience;
}

// tslint:disable-next-line:no-empty-interface
interface IPendingReviewTrackableListContainerState {}

interface IGetDataResponse {
    getPendingReviewTrackables:
        IConnection<IPendingReviewTrackableListItemNode, number>;
}

const log = makeLog("pending-review-trackable-list-container");

const withApprove = graphql<
    IApproveTrackableResponse,
    IOwnProps,
    IPendingReviewTrackableListContainerProps
>(
    approveTrackableQuery,
    {
        props: ({ ownProps, mutate }) => {
            return {
                onCommitApproveItem: (id: string, difficulty: Difficulty) =>
                    approveTrackable(id, difficulty, mutate!, ownProps.client),
            } as Partial<IPendingReviewTrackableListContainerProps>;
        },
    },
);

const withReject = graphql<
    IRejectTrackableResponse,
    IOwnProps,
    IPendingReviewTrackableListContainerProps
>(
    rejectTrackableQuery,
    {
        props: ({ ownProps, mutate }) => {
            return {
                onCommitRejectItem: (id: string, reason: RejectReason) =>
                    rejectTrackable(id, reason, mutate!, ownProps.client),
            } as Partial<IPendingReviewTrackableListContainerProps>;
        },
    },
);

const getDataQuery = gql`
query GetData($audience: Audience!, $skipUser: Boolean!, $cursor: Float) {
    getPendingReviewTrackables(
        audience: $audience, after: $cursor
    ) @connection(
        key: "getPendingReviewTrackables", filter: ["audience"]
    ) {
        edges {
            cursor
            node {
                id
                status
                statusChangeDate
                creationDate
                title
                user @skip(if: $skipUser) {
                    id
                    name
                    avatarUrlSmall
                }
                ... on IPrimitiveTrackable {
                    iconName
                }
                ... on IGoal {
                    achievementDate
                    myReviewStatus
                    approveCount
                    rejectCount
                    proofPhotoUrlMedium
                }
            }
        }
        pageInfo {
            hasNextPage
            endCursor
        }
    }
}`;

const withData = graphql<
    IGetDataResponse,
    IOwnProps,
    IPendingReviewTrackableListContainerProps
>(
    getDataQuery,
    {
        options: (ownProps) => {
            const { audience, fetchPolicy } = ownProps;
            return {
                fetchPolicy,
                notifyOnNetworkStatusChange: true,
                variables: { audience, skipUser: audience === Audience.Me },
            };
        },
        skip: (ownProps: IOwnProps) => !ownProps.session.userId,
    },
);

const difficulties: Array< IActionSheetOption<Difficulty> > = [
    {
        id: Difficulty.Easy,
        msgId: "difficulties.easy",
    },
    {
        id: Difficulty.Medium,
        msgId: "difficulties.medium",
    },
    {
        id: Difficulty.Hard,
        msgId: "difficulties.hard",
    },
    {
        id: Difficulty.Impossible,
        msgId: "difficulties.impossible",
    },
];

const rejectReasons: Array< IActionSheetOption<RejectReason> > = [
    {
        id: RejectReason.Abuse,
        msgId: "reasons.abuse",
    },
    {
        id: RejectReason.Spam,
        msgId: "reasons.spam",
    },
    {
        id: RejectReason.Fake,
        msgId: "reasons.fake",
    },
    {
        id: RejectReason.Other,
        msgId: "reasons.other",
    },
];

class PendingReviewTrackableListContainer extends React.Component<
    IPendingReviewTrackableListContainerProps,
    IPendingReviewTrackableListContainerState
> {
    public state: IPendingReviewTrackableListContainerState = { toasts: [] };

    public render() {
        const { audience, data, isRefreshing, onLoadMore, onRefresh } =
            this.props;
        return (
            <PendingReviewTrackableList
                audience={audience}
                items={data.getPendingReviewTrackables.edges}
                queryStatus={data.networkStatus}
                isRefreshing={isRefreshing}
                onApproveItem={this.onStartApproveItem}
                onEndReached={onLoadMore}
                onPressUser={this.onPressUser}
                onRejectItem={this.onStartRejectItem}
                onRefresh={onRefresh && this.onRefresh}
            />
        );
    }

    private showToast(
       msgId: string,
       msgValues?: { [key: string]: MessageValue },
       sound?: Sound,
    ) {
        const toast = {
            msgId,
            msgValues,
            severity: ToastSeverity.Info,
            sound,
        };
        addToast(toast, this.props.client);
    }

    private onStartApproveItem = (id: string) => {
        Analytics.log(AnalyticsEvent.TrackableReview, {
            context: AnalyticsContext.PendingReviewPage,
            status: ReviewStatus.Approved,
        });
        const isUserLoggedIn =
            this.props.onEnsureUserLoggedIn(AnalyticsContext.PendingReviewPage);

        if (!isUserLoggedIn) {
            return;
        }

        const { intl } = this.props;
        ActionSheet.open({
            onClose: (difficulty) => this.onCommitApproveItem(id, difficulty),
            options: difficulties,
            titleMsgId: "approveTrackable.title",
            translator: intl,
        });
    }

    private async onCommitApproveItem(id: string, difficulty?: Difficulty) {
        if (!difficulty) {
            Analytics.log(AnalyticsEvent.ApproveDifficultyPickerCancel);
            return;
        }

        Analytics.log(AnalyticsEvent.ApproveDifficultyPickerSubmit, { difficulty });
        this.props.diContainer.audioManager.play(Sound.Approve);
        let response;

        try {
            response =
                await this.props.onCommitApproveItem(id, difficulty);
        } catch (e) {
            return;
        }

        this.tryShowReviewRewardToast(response.approveTrackable.bonusRating);
    }

    private onStartRejectItem = (id: string) => {
        Analytics.log(AnalyticsEvent.TrackableReview, {
            context: AnalyticsContext.PendingReviewPage,
            status: ReviewStatus.Rejected,
        });
        const isUserLoggedIn =
            this.props.onEnsureUserLoggedIn(AnalyticsContext.PendingReviewPage);

        if (!isUserLoggedIn) {
            return;
        }

        const { intl } = this.props;
        ActionSheet.open({
            onClose: (rejectReason) =>
                this.onCommitRejectItem(id, rejectReason),
            options: rejectReasons,
            titleMsgId: "rejectTrackable.title",
            translator: intl,
        });
    }

    private async onCommitRejectItem(id: string, reason?: RejectReason) {
        if (!reason) {
            Analytics.log(AnalyticsEvent.RejectReasonPickerCancel);
            return;
        }

        Analytics.log(AnalyticsEvent.RejectReasonPickerSubmit, { reason });
        this.props.diContainer.audioManager.play(Sound.Reject);
        let response;

        try {
            response =
                await this.props.onCommitRejectItem(id, reason);
        } catch (e) {
            return;
        }

        this.tryShowReviewRewardToast(response.rejectTrackable.bonusRating);
    }

    private tryShowReviewRewardToast(bonusRating?: number) {
        if (!bonusRating) {
            return;
        }

        this.showToast("notifications.reviewRewarded", { rating: bonusRating });
    }

    private onPressUser = (id: string) => {
        Analytics.log(AnalyticsEvent.PendingReviewPageOpenUser);
        const historyState: IStackingSwitchHistoryState = {
            stackingSwitch: {
                animation: StackingSwitchAnimation.SlideInRight,
            },
        };
        const route = routes.profileActiveTrackables.path.replace(":id", id);
        this.props.history.push(route, historyState);
    }

    private onRefresh = () => {
        Analytics.log(AnalyticsEvent.ListRefresh,
            { context: AnalyticsContext.PendingReviewPage });
        this.props.onRefresh!();
    }
}

export default compose(
    withDIContainer,
    withApollo,
    withSession,
    withLogin<IPendingReviewTrackableListContainerProps>(
        "pendingReviewList.loginToSeeFriends",
        AnalyticsContext.PendingReviewPage,
        (props) => props.audience === Audience.Friends,
    ),
    withRouter,
    withNetworkStatus,
    withSyncStatus,
    withFetchPolicy<IPendingReviewTrackableListContainerProps>({
        getNamespace: (props) => props.audience,
        isMyData: (props) => props.audience === Audience.Me,
        isReadonlyData: () => false,
    }),
    withData,
    withNoUpdatesInBackground,
    withLoader<IPendingReviewTrackableListContainerProps, IGetDataResponse>(
        Loader,
        {
            dataField: "getPendingReviewTrackables",
            getQuery: (props) => props.data,
        },
    ),
    withError<IPendingReviewTrackableListContainerProps, IGetDataResponse>(
        Error,
        {
            dataField: "getPendingReviewTrackables",
            getQuery: (props) => props.data,
        },
    ),
    withOffline<IPendingReviewTrackableListContainerProps, IGetDataResponse>(
        Offline,
        {
            dataField: "getPendingReviewTrackables",
            getQuery: (props) => props.data,
        },
    ),
    withRefresh<IPendingReviewTrackableListContainerProps, IGetDataResponse>({
        dataField: "getPendingReviewTrackables",
        getQuery: (props) => props.data,
        isMyData: (props) => props.audience === Audience.Me,
        isReadonlyData: () => false,
    }),
    withEmptyList<IPendingReviewTrackableListContainerProps>(
        EmptyList,
        (props) => props.data.getPendingReviewTrackables,
    ),
    withApprove,
    withReject,
    withLoadMore<IPendingReviewTrackableListContainerProps, IGetDataResponse>({
        analyticsContext: AnalyticsContext.PendingReviewPage,
        dataField: "getPendingReviewTrackables",
        getQuery: (props) => props.data,
    }),
    injectIntl,
    withLoginAction,
    withEnsureUserLoggedIn(),
)(PendingReviewTrackableListContainer);

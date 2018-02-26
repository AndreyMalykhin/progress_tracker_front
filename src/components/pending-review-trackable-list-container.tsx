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
import { isAnonymous } from "actions/session-helpers";
import { addGenericErrorToast, addToast } from "actions/toast-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import ActionSheet, { IActionSheetOption } from "components/action-sheet";
import EmptyList from "components/empty-list";
import Error from "components/error";
import Loader from "components/loader";
import PendingReviewTrackableList, {
    IPendingReviewTrackableListItemNode,
} from "components/pending-review-trackable-list";
import withEmptyList from "components/with-empty-list";
import withEnsureUserLoggedIn, {
    IWithEnsureUserLoggedInProps,
} from "components/with-ensure-user-logged-in";
import withError from "components/with-error";
import withLoadMore, { IWithLoadMoreProps } from "components/with-load-more";
import withLoader from "components/with-loader";
import withLogin from "components/with-login";
import withLoginAction, {
    IWithLoginActionProps,
} from "components/with-login-action";
import withNoUpdatesInBackground from "components/with-no-updates-in-background";
import withRefresh, { IWithRefreshProps } from "components/with-refresh";
import withRefreshOnFirstLoad, {
    IWithRefreshOnFirstLoadProps,
} from "components/with-refresh-on-first-load";
import withSession, { IWithSessionProps } from "components/with-session";
import gql from "graphql-tag";
import Audience from "models/audience";
import Difficulty from "models/difficulty";
import RejectReason from "models/reject-reason";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { withApollo } from "react-apollo/withApollo";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import { Alert, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { RouteComponentProps, withRouter } from "react-router";
import { IConnection } from "utils/connection";
import defaultId from "utils/default-id";
import getDataOrQueryStatus from "utils/get-data-or-query-status";
import { push, removeIndex } from "utils/immutable-utils";
import { IWithApolloProps } from "utils/interfaces";
import QueryStatus from "utils/query-status";
import routes from "utils/routes";

interface IOwnProps extends
    RouteComponentProps<{}>,
    IWithApolloProps,
    IWithRefreshOnFirstLoadProps,
    IWithSessionProps {
    audience: Audience;
}

interface IPendingReviewTrackableListContainerProps extends
    IOwnProps,
    InjectedIntlProps,
    IWithEnsureUserLoggedInProps,
    IWithLoginActionProps,
    IWithRefreshProps,
    IWithLoadMoreProps {
    data: QueryProps & IGetDataResponse;
    onCommitApproveItem: (id: string, difficulty: Difficulty) =>
        Promise<IApproveTrackableResponse>;
    onCommitRejectItem: (id: string, reason: RejectReason) =>
        Promise<IRejectTrackableResponse>;
}

// tslint:disable-next-line:no-empty-interface
interface IPendingReviewTrackableListContainerState {}

interface IGetDataResponse {
    getPendingReviewTrackables:
        IConnection<IPendingReviewTrackableListItemNode, number>;
}

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
                user @skip(if: $skipUser) {
                    id
                    name
                    avatarUrlSmall
                }
                ... on IPrimitiveTrackable {
                    title
                    iconName
                }
                ... on IGoal {
                    isReviewed
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
            const { audience, session } = ownProps;
            let { fetchPolicy } = ownProps;

            if (audience === Audience.Me && isAnonymous(session)) {
                fetchPolicy = "cache-only";
            }

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
                onRefresh={onRefresh}
            />
        );
    }

    private showToast(
       msgId: string, msgValues?: { [key: string]: string|number },
    ) {
        const toast = {
            msg: this.props.intl.formatMessage({ id: msgId }, msgValues),
        };
        addToast(toast, this.props.client);
    }

    private onStartApproveItem = (id: string) => {
        if (!this.props.onEnsureUserLoggedIn()) {
            return;
        }

        const { intl } = this.props;
        ActionSheet.open({
            onClose: (difficulty) => {
                if (difficulty) {
                    this.commitApproveItem(id, difficulty);
                }
            },
            options: difficulties,
            titleMsgId: "approveTrackable.title",
            translator: intl,
        });
    }

    private async commitApproveItem(id: string, difficulty: Difficulty) {
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
        if (!this.props.onEnsureUserLoggedIn()) {
            return;
        }

        const { intl } = this.props;
        ActionSheet.open({
            onClose: (rejectReason) => {
                if (rejectReason) {
                    this.commitRejectItem(id, rejectReason);
                }
            },
            options: rejectReasons,
            titleMsgId: "rejectTrackable.title",
            translator: intl,
        });
    }

    private async commitRejectItem(id: string, reason: RejectReason) {
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
        this.props.history.push(
            routes.profileActiveTrackables.path.replace(":id", id));
    }
}

export default compose(
    withSession,
    withLogin<IPendingReviewTrackableListContainerProps>(
        "pendingReviewList.loginToSeeFriends",
        (props) => props.audience === Audience.Friends,
    ),
    withRouter,
    withRefreshOnFirstLoad<IPendingReviewTrackableListContainerProps>(
        (props) => props.audience),
    withData,
    withNoUpdatesInBackground,
    withLoader(Loader, { minDuration: 512 }),
    withError(Error),
    withRefresh<IPendingReviewTrackableListContainerProps>((props) =>
        !isAnonymous(props.session) || props.audience !== Audience.Me),
    withEmptyList<IPendingReviewTrackableListContainerProps>(
        EmptyList,
        (props) => props.data.getPendingReviewTrackables.edges,
    ),
    withApollo,
    withApprove,
    withReject,
    withLoginAction,
    withLoadMore<IPendingReviewTrackableListContainerProps, IGetDataResponse>(
        "getPendingReviewTrackables", (props) => props.data),
    injectIntl,
    withEnsureUserLoggedIn,
)(PendingReviewTrackableListContainer);

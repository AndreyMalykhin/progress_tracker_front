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
import withError from "components/with-error";
import withLoadMore, { IWithLoadMoreProps } from "components/with-load-more";
import withLoader from "components/with-loader";
import withLogin, { IWithLoginProps } from "components/with-login";
import gql from "graphql-tag";
import Audience from "models/audience";
import RejectReason from "models/reject-reason";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { withApollo } from "react-apollo/withApollo";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { RouteComponentProps, withRouter } from "react-router";
import { IConnection } from "utils/connection";
import Difficulty from "utils/difficulty";
import { IWithApollo } from "utils/interfaces";
import QueryStatus from "utils/query-status";
import routes from "utils/routes";

interface IOwnProps extends RouteComponentProps<{}>, IWithApollo {
    audience: Audience;
}

interface IGetDataResponse {
    getPendingReviewTrackablesByAudience:
        IConnection<IPendingReviewTrackableListItemNode, number>;
}

interface IPendingReviewTrackableListContainerProps extends
    IOwnProps, IWithLoginProps, InjectedIntlProps, IWithLoadMoreProps {
    data: QueryProps & IGetDataResponse;
    onCommitApproveItem: (id: string, difficulty: Difficulty) => void;
    onCommitRejectItem: (id: string, reason: RejectReason) => void;
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
    getPendingReviewTrackablesByAudience(
        audience: $audience, after: $cursor
    ) @connection(
        key: "getPendingReviewTrackablesByAudience", filter: ["audience"]
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
            const { audience } = ownProps;
            return {
                notifyOnNetworkStatusChange: true,
                variables: { audience, skipUser: audience === Audience.Me },
            };
        },
        props: ({ data }) => {
            const { networkStatus: queryStatus } = data!;

            if (queryStatus === QueryStatus.InitialLoading
                || queryStatus === QueryStatus.Error
            ) {
                return { queryStatus } as
                    Partial<IPendingReviewTrackableListContainerProps>;
            }

            return { queryStatus, data } as
                Partial<IPendingReviewTrackableListContainerProps>;
        },
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

class PendingReviewTrackableListContainer extends
    React.Component<IPendingReviewTrackableListContainerProps> {
    public render() {
        const { audience, data, onLoadMore } = this.props;
        return (
            <PendingReviewTrackableList
                audience={audience}
                items={data.getPendingReviewTrackablesByAudience.edges}
                queryStatus={data.networkStatus}
                onApproveItem={this.onStartApproveItem}
                onEndReached={onLoadMore}
                onPressUser={this.onPressUser}
                onRejectItem={this.onStartRejectItem}
            />
        );
    }

    private onStartApproveItem = (id: string) => {
        const { intl, onCommitApproveItem } = this.props;
        ActionSheet.open({
            onClose: (difficulty) => {
                if (difficulty) {
                    onCommitApproveItem(id, difficulty);
                }
            },
            options: difficulties,
            titleMsgId: "approveTrackable.title",
            translator: intl,
        });
    }

    private onStartRejectItem = (id: string) => {
        const { intl, onCommitRejectItem } = this.props;
        ActionSheet.open({
            onClose: (rejectReason) => {
                if (rejectReason) {
                    onCommitRejectItem(id, rejectReason);
                }
            },
            options: rejectReasons,
            titleMsgId: "rejectTrackable.title",
            translator: intl,
        });
    }

    private onPressUser = (id: string) => {
        this.props.history.push(
            routes.profileActiveTrackables.path.replace(":id", id));
    }
}

export default compose(
    withLogin<IPendingReviewTrackableListContainerProps>(
        "pendingReviewList.friendsLoginMsg",
        (props) => props.audience === Audience.Friends,
    ),
    withRouter,
    withData,
    withLoader(Loader, 512),
    withError(Error),
    withEmptyList<IPendingReviewTrackableListContainerProps>(
        EmptyList,
        (props) => props.data.getPendingReviewTrackablesByAudience.edges,
    ),
    withApollo,
    withApprove,
    withReject,
    withLoadMore<IPendingReviewTrackableListContainerProps, IGetDataResponse>(
        "getPendingReviewTrackablesByAudience", (props) => props.data),
    injectIntl,
)(PendingReviewTrackableListContainer);

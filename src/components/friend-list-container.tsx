import {
    ISetUserMutedResponse,
    setUserMuted,
    setUserMutedQuery,
} from "actions/set-user-muted-action";
import EmptyList from "components/empty-list";
import Error from "components/error";
import FriendList, { IFriendListItemNode } from "components/friend-list";
import Loader from "components/loader";
import Offline from "components/offline";
import {
    IStackingSwitchHistoryState,
    StackingSwitchAnimation,
} from "components/stacking-switch";
import withDIContainer from "components/with-di-container";
import withEmptyList from "components/with-empty-list";
import withError from "components/with-error";
import withFetchPolicy, {
    IWithFetchPolicyProps,
} from "components/with-fetch-policy";
import withLoadMore, { IWithLoadMoreProps } from "components/with-load-more";
import withLoader from "components/with-loader";
import withLogin from "components/with-login";
import withNetworkStatus, {
    IWithNetworkStatusProps,
} from "components/with-network-status";
import withNoUpdatesInBackground from "components/with-no-updates-in-background";
import withOffline from "components/with-offline";
import withRefresh, { IWithRefreshProps } from "components/with-refresh";
import withSession, { IWithSessionProps } from "components/with-session";
import withSyncStatus from "components/with-sync-status";
import gql from "graphql-tag";
import * as React from "react";
import { compose, QueryProps } from "react-apollo";
import graphql from "react-apollo/graphql";
import { RouteComponentProps, withRouter } from "react-router";
import Analytics from "utils/analytics";
import AnalyticsContext from "utils/analytics-context";
import AnalyticsEvent from "utils/analytics-event";
import { IConnection } from "utils/connection";
import defaultErrorPolicy from "utils/default-error-policy";
import { IWithApolloProps } from "utils/interfaces";
import makeLog from "utils/make-log";
import QueryStatus from "utils/query-status";
import routes from "utils/routes";

interface IFriendListContainerProps extends
    IOwnProps, IWithLoadMoreProps, IWithRefreshProps, RouteComponentProps<{}> {
    data: QueryProps & IGetDataResponse;
    onSetItemMuted: (id: string, isMuted: boolean) => Promise<any>;
}

interface IOwnProps extends
    IWithFetchPolicyProps,
    IWithApolloProps,
    IWithSessionProps,
    IWithNetworkStatusProps {}

interface IGetDataResponse {
    getFriends: IConnection<IFriendListItemNode, number>;
}

const log = makeLog("friend-list-container");

const withSetMuted = graphql<
    ISetUserMutedResponse,
    IOwnProps,
    IFriendListContainerProps
>(
    setUserMutedQuery,
    {
        props: ({ ownProps, mutate }) => {
            return {
                onSetItemMuted: (id: string, isMuted: boolean) =>
                    setUserMuted(id, isMuted, mutate!, ownProps.client),
            };
        },
    },
);

const getDataQuery = gql`
query GetData($cursor: Float) {
    getFriends(after: $cursor) @connection(key: "getFriends") {
        edges {
            cursor
            node {
                id
                name
                avatarUrlSmall
                isMuted
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
    IFriendListContainerProps
>(
    getDataQuery,
    {
        options: (ownProps) => {
            return {
                errorPolicy: defaultErrorPolicy,
                fetchPolicy: ownProps.fetchPolicy,
                notifyOnNetworkStatusChange: true,
            };
        },
        skip: (ownProps: IOwnProps) => !ownProps.session.userId,
    },
);

class FriendListContainer extends React.Component<IFriendListContainerProps> {
    public render() {
        const { data, isRefreshing, onLoadMore, onRefresh } = this.props;
        return (
            <FriendList
                isRefreshing={isRefreshing}
                items={data.getFriends.edges}
                queryStatus={data.networkStatus}
                onEndReached={onLoadMore}
                onSetItemMuted={this.onSetItemMuted}
                onPressItem={this.onPressItem}
                onRefresh={onRefresh && this.onRefresh}
            />
        );
    }

    private onSetItemMuted = async (id: string, isMuted: boolean) => {
        Analytics.log(AnalyticsEvent.FriendsPageSetMuted,
            { isMuted: isMuted ? 1 : 0 });

        try {
            await this.props.onSetItemMuted(id, isMuted);
        } catch (e) {
            // already reported
        }
    }

    private onPressItem = (id: string) => {
        Analytics.log(AnalyticsEvent.FriendsPageOpenUser);
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
            { context: AnalyticsContext.FriendsPage });
        this.props.onRefresh!();
    }
}

export default compose(
    withDIContainer,
    withSession,
    withLogin("friends.loginToSee", AnalyticsContext.FriendsPage),
    withRouter,
    withNetworkStatus,
    withSyncStatus,
    withFetchPolicy({
        isMyData: () => true,
        isReadonlyData: () => false,
    }),
    withData,
    withNoUpdatesInBackground,
    withLoader<IFriendListContainerProps, IGetDataResponse>(Loader, {
        dataField: "getFriends",
        getQuery: (props) => props.data,
    }),
    withError<IFriendListContainerProps, IGetDataResponse>(Error, {
        dataField: "getFriends",
        getQuery: (props) => props.data,
    }),
    withOffline<IFriendListContainerProps, IGetDataResponse>(Offline, {
        dataField: "getFriends",
        getQuery: (props) => props.data,
    }),
    withRefresh<IFriendListContainerProps, IGetDataResponse>({
        dataField: "getFriends",
        getQuery: (props) => props.data,
        isMyData: () => true,
        isReadonlyData: () => false,
    }),
    withEmptyList<IFriendListContainerProps>(
        EmptyList, (props) => props.data.getFriends),
    withLoadMore<IFriendListContainerProps, IGetDataResponse>({
        analyticsContext: AnalyticsContext.FriendsPage,
        dataField: "getFriends",
        getQuery: (props) => props.data,
    }),
    withSetMuted,
)(FriendListContainer);

import {
    ISetUserMutedResponse,
    setUserMuted,
    setUserMutedQuery,
} from "actions/set-user-muted-action";
import EmptyList from "components/empty-list";
import Error from "components/error";
import FriendList, { IFriendListItemNode } from "components/friend-list";
import Loader from "components/loader";
import withEmptyList from "components/with-empty-list";
import withError from "components/with-error";
import withLoadMore, { IWithLoadMoreProps } from "components/with-load-more";
import withLoader from "components/with-loader";
import withLogin from "components/with-login";
import withNoUpdatesInBackground from "components/with-no-updates-in-background";
import withRefresh, { IWithRefreshProps } from "components/with-refresh";
import withRefreshOnFirstLoad, {
    IWithRefreshOnFirstLoadProps,
} from "components/with-refresh-on-first-load";
import withSession, { IWithSessionProps } from "components/with-session";
import gql from "graphql-tag";
import * as React from "react";
import { compose, QueryProps } from "react-apollo";
import graphql from "react-apollo/graphql";
import { RouteComponentProps, withRouter } from "react-router";
import { IConnection } from "utils/connection";
import getDataOrQueryStatus from "utils/get-data-or-query-status";
import { IWithApolloProps } from "utils/interfaces";
import QueryStatus from "utils/query-status";
import routes from "utils/routes";

interface IFriendListContainerProps extends
    IWithLoadMoreProps, IWithRefreshProps, RouteComponentProps<{}> {
    data: QueryProps & IGetDataResponse;
    onSetItemMuted: (id: string, isMuted: boolean) => Promise<any>;
}

interface IOwnProps extends
    IWithRefreshOnFirstLoadProps, IWithApolloProps, IWithSessionProps {}

interface IGetDataResponse {
    getFriends: IConnection<IFriendListItemNode, number>;
}

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
                onRefresh={onRefresh}
            />
        );
    }

    private onSetItemMuted = async (id: string, isMuted: boolean) => {
        try {
            await this.props.onSetItemMuted(id, isMuted);
        } catch (e) {
            // already reported
        }
    }

    private onPressItem = (id: string) => {
        this.props.history.push(
            routes.profileActiveTrackables.path.replace(":id", id));
    }
}

export default compose(
    withSession,
    withLogin("friends.loginToSee"),
    withRouter,
    withRefreshOnFirstLoad(),
    withData,
    withNoUpdatesInBackground,
    withLoader(Loader, { minDuration: 512 }),
    withError(Error),
    withRefresh(),
    withEmptyList<IFriendListContainerProps>(
        EmptyList, (props) => props.data.getFriends.edges),
    withLoadMore<IFriendListContainerProps, IGetDataResponse>(
        "getFriends", (props) => props.data),
    withSetMuted,
)(FriendListContainer);

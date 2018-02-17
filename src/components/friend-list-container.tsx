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
import withRefetchOnFirstLoad, {
    IWithRefetchOnFirstLoadProps,
} from "components/with-refetch-on-first-load";
import gql from "graphql-tag";
import * as React from "react";
import { compose, QueryProps } from "react-apollo";
import graphql from "react-apollo/graphql";
import { RouteComponentProps, withRouter } from "react-router";
import { IConnection } from "utils/connection";
import { IWithApolloProps } from "utils/interfaces";
import QueryStatus from "utils/query-status";
import routes from "utils/routes";

interface IFriendListContainerProps extends
    IWithLoadMoreProps, RouteComponentProps<{}> {
    data: QueryProps & IGetDataResponse;
    onSetItemMuted: (id: string, isMuted: boolean) => void;
}

interface IOwnProps extends IWithRefetchOnFirstLoadProps, IWithApolloProps {}

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
        props: ({ data }) => {
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

class FriendListContainer extends React.Component<IFriendListContainerProps> {
    public render() {
        const { data, onLoadMore, onSetItemMuted } = this.props;
        return (
            <FriendList
                items={data.getFriends.edges}
                queryStatus={data.networkStatus}
                onEndReached={onLoadMore}
                onSetItemMuted={onSetItemMuted}
                onPressItem={this.onPressItem}
            />
        );
    }

    private onPressItem = (id: string) => {
        this.props.history.push(
            routes.profileActiveTrackables.path.replace(":id", id));
    }
}

export default compose(
    withLogin("friends.loginToSee"),
    withRouter,
    withRefetchOnFirstLoad(),
    withData,
    withNoUpdatesInBackground,
    withLoader(Loader, 512),
    withError(Error),
    withEmptyList<IFriendListContainerProps>(
        EmptyList, (props) => props.data.getFriends.edges),
    withLoadMore<IFriendListContainerProps, IGetDataResponse>(
        "getFriends", (props) => props.data),
    withSetMuted,
)(FriendListContainer);

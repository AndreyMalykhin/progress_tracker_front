import EmptyList from "components/empty-list";
import Error from "components/error";
import LeaderList, { ILeaderListItemNode } from "components/leader-list";
import Loader from "components/loader";
import Offline from "components/offline";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
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
import withSyncStatus, {
    IWithSyncStatusProps,
} from "components/with-sync-status";
import gql from "graphql-tag";
import Audience from "models/audience";
import * as React from "react";
import { compose, QueryProps } from "react-apollo";
import graphql from "react-apollo/graphql";
import { RouteComponentProps, withRouter } from "react-router";
import { IConnection } from "utils/connection";
import routes from "utils/routes";

interface ILeaderListContainerProps extends
    IOwnProps,
    IWithLoadMoreProps,
    IWithRefreshProps,
    IWithDIContainerProps,
    RouteComponentProps<{}>,
    IWithSyncStatusProps {
    data: QueryProps & IGetDataResponse;
    audience: Audience;
}

interface IOwnProps extends
    IWithFetchPolicyProps, IWithSessionProps, IWithNetworkStatusProps {}

interface IGetDataResponse {
    getLeaders: IConnection<ILeaderListItemNode, number>;
}

const getDataQuery = gql`
query GetData($audience: Audience!, $cursor: Float) {
    getLeaders(
        audience: $audience, after: $cursor
    ) @connection(key: "getLeaders", filter: ["audience"]) {
        edges {
            cursor
            node {
                id
                name
                rating
                avatarUrlSmall
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
    ILeaderListContainerProps
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

class LeaderListContainer extends React.Component<ILeaderListContainerProps> {
    public render() {
        const { data, isRefreshing, onLoadMore, onRefresh } = this.props;
        return (
            <LeaderList
                isRefreshing={isRefreshing}
                items={data.getLeaders.edges}
                queryStatus={data.networkStatus}
                onEndReached={onLoadMore}
                onPressItem={this.onPressItem}
                onRefresh={onRefresh}
            />
        );
    }

    private onPressItem = (id: string) => {
        this.props.history.push(
            routes.profileActiveTrackables.path.replace(":id", id));
    }
}

export default compose(
    withDIContainer,
    withSession,
    withLogin<ILeaderListContainerProps>("leaderList.loginToSeeFriends",
        (props) => props.audience === Audience.Friends),
    withRouter,
    withNetworkStatus,
    withSyncStatus,
    withFetchPolicy<ILeaderListContainerProps>({
        getNamespace: (props) => props.audience,
        isMyData: (props) => props.audience === Audience.Friends,
        isReadonlyData: () => true,
    }),
    withData,
    withNoUpdatesInBackground,
    withLoader<ILeaderListContainerProps, IGetDataResponse>(Loader, {
        dataField: "getLeaders",
        getQuery: (props) => props.data,
    }),
    withError<ILeaderListContainerProps>(Error, (props) => props.data),
    withOffline<ILeaderListContainerProps, IGetDataResponse>(
        Offline, "getLeaders", (props) => props.data),
    withRefresh<ILeaderListContainerProps>({
        getQuery: (props) => props.data,
        isMyData: (props) => props.audience === Audience.Friends,
        isReadonlyData: () => true,
    }),
    withEmptyList<ILeaderListContainerProps>(
        EmptyList, (props) => props.data.getLeaders.edges),
    withLoadMore<ILeaderListContainerProps, IGetDataResponse>(
        "getLeaders", (props) => props.data),
)(LeaderListContainer);

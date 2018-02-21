import EmptyList from "components/empty-list";
import Error from "components/error";
import LeaderList, { ILeaderListItemNode } from "components/leader-list";
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
import withSession, { IWithSessionProps } from "components/with-session";
import gql from "graphql-tag";
import Audience from "models/audience";
import * as React from "react";
import { compose, QueryProps } from "react-apollo";
import graphql from "react-apollo/graphql";
import { RouteComponentProps, withRouter } from "react-router";
import { IConnection } from "utils/connection";
import routes from "utils/routes";

interface ILeaderListContainerProps extends
    IOwnProps, IWithLoadMoreProps, RouteComponentProps<{}> {
    data: QueryProps & IGetDataResponse;
    audience: Audience;
}

interface IOwnProps extends
    IWithRefetchOnFirstLoadProps, IWithSessionProps {}

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
        const { data, onLoadMore } = this.props;
        return (
            <LeaderList
                items={data.getLeaders.edges}
                queryStatus={data.networkStatus}
                onEndReached={onLoadMore}
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
    withSession,
    withLogin<ILeaderListContainerProps>("leaderList.loginToSeeFriends",
        (props) => props.audience === Audience.Friends),
    withRouter,
    withRefetchOnFirstLoad<ILeaderListContainerProps>(
        (props) => props.audience),
    withData,
    withNoUpdatesInBackground,
    withLoader(Loader),
    withError(Error),
    withEmptyList<ILeaderListContainerProps>(
        EmptyList, (props) => props.data.getLeaders.edges),
    withLoadMore<ILeaderListContainerProps, IGetDataResponse>(
        "getLeaders", (props) => props.data),
)(LeaderListContainer);

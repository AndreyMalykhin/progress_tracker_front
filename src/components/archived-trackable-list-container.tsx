import ArchivedTrackableList, {
    IArchivedTrackableListItemNode,
} from "components/archived-trackable-list";
import EmptyList from "components/empty-list";
import Error from "components/error";
import Loader from "components/loader";
import withEmptyList from "components/with-empty-list";
import withError from "components/with-error";
import withLoadMore, { IWithLoadMoreProps } from "components/with-load-more";
import withLoader from "components/with-loader";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { RouteComponentProps, withRouter } from "react-router";
import { IConnection } from "utils/connection";
import myId from "utils/my-id";
import QueryStatus, { isLoading } from "utils/query-status";

interface IGetDataResponse {
    getArchivedTrackables: IConnection<IArchivedTrackableListItemNode, number>;
}

interface IOwnProps {
    userId: string;
    trackableStatus: TrackableStatus;
}

interface IArchivedTrackableListContainerProps extends
    IWithLoadMoreProps, IOwnProps {
    data: QueryProps & IGetDataResponse;
}

const getDataQuery = gql`
query GetData(
    $userId: ID!, $trackableStatus: TrackableStatus!, $cursor: Float
) {
    getArchivedTrackables(
        userId: $userId, status: $trackableStatus, after: $cursor
    ) @connection(key: "getArchivedTrackables", filter: ["userId", "status"]) {
        pageInfo {
            hasNextPage
            endCursor
        }
        edges {
            cursor
            node {
                id
                status
                statusChangeDate
                creationDate
                ... on IPrimitiveTrackable {
                    title
                    iconName
                }
                ... on IGoal {
                    progress
                    maxProgress
                    progressDisplayMode
                    rating
                    approveCount
                    rejectCount
                    proofPhotoUrlMedium
                }
            }
        }
    }
}`;

const withData = graphql<
    IGetDataResponse,
    IOwnProps,
    IArchivedTrackableListContainerProps
>(
    getDataQuery,
    {
        options: (ownProps) => {
            const { userId, trackableStatus } = ownProps;
            return {
                notifyOnNetworkStatusChange: true,
                variables: { userId, trackableStatus },
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

class ArchivedTrackableListContainer extends
    React.Component<IArchivedTrackableListContainerProps> {
    public render() {
        const { data, trackableStatus } = this.props;
        return (
            <ArchivedTrackableList
                trackableStatus={trackableStatus}
                items={data.getArchivedTrackables.edges}
                queryStatus={data.networkStatus}
                onEndReached={this.onEndReached}
            />
        );
    }

    private onEndReached = () => this.props.onLoadMore();
}

export default compose(
    withRouter,
    withData,
    withLoader(Loader, 512),
    withError(Error),
    withEmptyList<IArchivedTrackableListContainerProps>(
        EmptyList, (props) => props.data.getArchivedTrackables.edges),
    withLoadMore<IArchivedTrackableListContainerProps, IGetDataResponse>(
        "getArchivedTrackables", (props) => props.data),
)(ArchivedTrackableListContainer);

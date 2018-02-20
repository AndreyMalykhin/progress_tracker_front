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
import withNoUpdatesInBackground from "components/with-no-updates-in-background";
import withRefetchOnFirstLoad, {
    IWithRefetchOnFirstLoadProps,
} from "components/with-refetch-on-first-load";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { IConnection } from "utils/connection";
import getDataOrQueryStatus from "utils/get-data-or-query-status";
import QueryStatus, { isLoading } from "utils/query-status";

interface IArchivedTrackableListContainerProps extends
    IWithLoadMoreProps, IOwnProps {
    data: QueryProps & IGetDataResponse;
}

interface IGetDataResponse {
    getArchivedTrackables: IConnection<IArchivedTrackableListItemNode, number>;
}

interface IOwnProps extends IWithRefetchOnFirstLoadProps {
    userId?: string;
    trackableStatus: TrackableStatus;
}

const getDataQuery = gql`
query GetData(
    $userId: ID!,
    $trackableStatus: TrackableStatus!,
    $skipProofedGoalFields: Boolean!,
    $cursor: Float
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
                    rating @skip(if: $skipProofedGoalFields)
                    approveCount @skip(if: $skipProofedGoalFields)
                    rejectCount @skip(if: $skipProofedGoalFields)
                    proofPhotoUrlMedium @skip(if: $skipProofedGoalFields)
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
                fetchPolicy: ownProps.fetchPolicy,
                notifyOnNetworkStatusChange: true,
                variables: {
                    skipProofedGoalFields:
                        trackableStatus === TrackableStatus.Expired,
                    trackableStatus,
                    userId,
                },
            };
        },
        props: ({ data }) => {
            return getDataOrQueryStatus(data!);
        },
        skip: (ownProps: IOwnProps) => !ownProps.userId,
    },
);

class ArchivedTrackableListContainer extends
    React.Component<IArchivedTrackableListContainerProps> {
    public render() {
        const { data, trackableStatus, onLoadMore } = this.props;
        return (
            <ArchivedTrackableList
                trackableStatus={trackableStatus}
                items={data.getArchivedTrackables.edges}
                queryStatus={data.networkStatus}
                onEndReached={onLoadMore}
            />
        );
    }
}

export default compose(
    withRefetchOnFirstLoad<IArchivedTrackableListContainerProps>(
        (props) => `${props.userId}_${props.trackableStatus}`),
    withData,
    withNoUpdatesInBackground,
    withLoader(Loader, 512),
    withError(Error),
    withEmptyList<IArchivedTrackableListContainerProps>(
        EmptyList, (props) => props.data.getArchivedTrackables.edges),
    withLoadMore<IArchivedTrackableListContainerProps, IGetDataResponse>(
        "getArchivedTrackables", (props) => props.data),
)(ArchivedTrackableListContainer);

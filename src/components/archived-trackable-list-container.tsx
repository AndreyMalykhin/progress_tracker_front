import ArchivedTrackableList, {
    IArchivedTrackableListItemNode,
} from "components/archived-trackable-list";
import Error from "components/error";
import Loader from "components/loader";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { RouteComponentProps, withRouter } from "react-router";
import { IConnection } from "utils/interfaces";
import loadMore from "utils/load-more";
import myId from "utils/my-id";
import QueryStatus, { isLoading } from "utils/query-status";
import withError from "utils/with-error";
import withLoader from "utils/with-loader";

interface IGetDataResponse {
    getArchivedTrackables: IConnection<IArchivedTrackableListItemNode, number>;
}

interface IOwnProps {
    userId: string;
    trackableStatus: TrackableStatus;
}

interface IArchivedTrackableListContainerProps {
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
        const { data } = this.props;
        return (
            <ArchivedTrackableList
                items={data.getArchivedTrackables.edges}
                queryStatus={data.networkStatus}
                onEndReached={this.onEndReached}
            />
        );
    }

    private onEndReached = () => {
        const responseField = "getArchivedTrackables";
        loadMore(this.props.data, responseField);
    }
}

export default compose(
    withRouter,
    withData,
    withLoader(Loader, 512),
    withError(Error),
)(ArchivedTrackableListContainer);

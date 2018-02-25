import { isAnonymous } from "actions/session-helpers";
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
import withRefresh, { IWithRefreshProps } from "components/with-refresh";
import withRefreshOnFirstLoad, {
    IWithRefreshOnFirstLoadProps,
} from "components/with-refresh-on-first-load";
import withSession, { IWithSessionProps } from "components/with-session";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { IConnection } from "utils/connection";
import defaultId from "utils/default-id";
import getDataOrQueryStatus from "utils/get-data-or-query-status";
import QueryStatus, { isLoading } from "utils/query-status";

interface IArchivedTrackableListContainerProps extends
    IWithLoadMoreProps, IWithRefreshProps, IOwnProps {
    data: QueryProps & IGetDataResponse;
}

interface IGetDataResponse {
    getArchivedTrackables: IConnection<IArchivedTrackableListItemNode, number>;
}

interface IOwnProps extends IWithRefreshOnFirstLoadProps, IWithSessionProps {
    userId: string;
    trackableStatus: TrackableStatus;
}

const getDataQuery = gql`
query GetData(
    $trackableStatus: TrackableStatus!,
    $skipProofedGoalFields: Boolean!,
    $userId: ID,
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
            const { trackableStatus, session } = ownProps;
            let userId: string|undefined = ownProps.userId;
            let { fetchPolicy } = ownProps;

            if (userId === defaultId || userId === session.userId) {
                userId = undefined;

                if (isAnonymous(session)) {
                    fetchPolicy = "cache-only";
                }
            }

            return {
                fetchPolicy,
                notifyOnNetworkStatusChange: true,
                variables: {
                    skipProofedGoalFields:
                        trackableStatus === TrackableStatus.Expired,
                    trackableStatus,
                    userId,
                },
            };
        },
        skip: (ownProps: IOwnProps) => !ownProps.session.userId,
    },
);

class ArchivedTrackableListContainer extends
    React.Component<IArchivedTrackableListContainerProps> {
    public render() {
        const { data, trackableStatus, isRefreshing, onLoadMore, onRefresh } =
            this.props;
        return (
            <ArchivedTrackableList
                isRefreshing={isRefreshing}
                trackableStatus={trackableStatus}
                items={data.getArchivedTrackables.edges}
                queryStatus={data.networkStatus}
                onEndReached={onLoadMore}
                onRefresh={onRefresh}
            />
        );
    }
}

export default compose(
    withSession,
    withRefreshOnFirstLoad<IArchivedTrackableListContainerProps>(
        (props) => `${props.userId}_${props.trackableStatus}`),
    withData,
    withNoUpdatesInBackground,
    withLoader(Loader, { minDuration: 512 }),
    withError(Error),
    withRefresh<IArchivedTrackableListContainerProps>((props) => {
        const { session, userId } = props;
        return !isAnonymous(session)
            || (userId !== defaultId && userId !== session.userId);
    }),
    withEmptyList<IArchivedTrackableListContainerProps>(
        EmptyList, (props) => props.data.getArchivedTrackables.edges),
    withLoadMore<IArchivedTrackableListContainerProps, IGetDataResponse>(
        "getArchivedTrackables", (props) => props.data),
)(ArchivedTrackableListContainer);

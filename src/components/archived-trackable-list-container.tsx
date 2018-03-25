import ArchivedTrackableList, {
    IArchivedTrackableListItemNode,
    IArchivedTrackableListOnGetStatusDuration,
} from "components/archived-trackable-list";
import EmptyList from "components/empty-list";
import Error from "components/error";
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
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import Analytics from "utils/analytics";
import AnalyticsContext from "utils/analytics-context";
import AnalyticsEvent from "utils/analytics-event";
import { IConnection } from "utils/connection";
import defaultId from "utils/default-id";
import isMyId from "utils/is-my-id";
import makeLog from "utils/make-log";
import QueryStatus, { isLoading } from "utils/query-status";

interface IArchivedTrackableListContainerProps extends
    IWithLoadMoreProps,
    IWithRefreshProps,
    IOwnProps,
    IWithDIContainerProps,
    IWithSyncStatusProps {
    data: QueryProps & IGetDataResponse;
}

interface IGetDataResponse {
    getArchivedTrackables: IConnection<IArchivedTrackableListItemNode, number>;
}

interface IOwnProps extends
    IWithFetchPolicyProps, IWithSessionProps, IWithNetworkStatusProps {
    userId: string;
    trackableStatus: TrackableStatus;
}

const log = makeLog("archived-trackable-list-container");

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
                title
                ... on IPrimitiveTrackable {
                    iconName
                }
                ... on IGoal {
                    achievementDate
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
            const { fetchPolicy, trackableStatus, session } = ownProps;
            let userId: string|undefined = ownProps.userId;

            if (userId === defaultId || userId === session.userId) {
                userId = undefined;
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
                onRefresh={onRefresh && this.onRefresh}
                onGetStatusDuration={this.onGetStatusDuration}
            />
        );
    }

    private onGetStatusDuration: IArchivedTrackableListOnGetStatusDuration = (
        status, statusChangeDate, creationDate, achievementDate,
    ) => {
        return status === TrackableStatus.Expired ?
            statusChangeDate - creationDate : achievementDate! - creationDate;
    }

    private onRefresh = () => {
        Analytics.log(AnalyticsEvent.ListRefresh,
            { context: AnalyticsContext.ArchivePage });
        this.props.onRefresh!();
    }
}

export default compose(
    withDIContainer,
    withSession,
    withNetworkStatus,
    withSyncStatus,
    withFetchPolicy<IArchivedTrackableListContainerProps>({
        getNamespace: (props) => `${props.userId}_${props.trackableStatus}`,
        isMyData: (props) => isMyId(props.userId, props.session),
        isReadonlyData: (props) => false,
    }),
    withData,
    withNoUpdatesInBackground,
    withLoader<IArchivedTrackableListContainerProps, IGetDataResponse>(Loader, {
        dataField: "getArchivedTrackables",
        getQuery: (props) => props.data,
    }),
    withError<IArchivedTrackableListContainerProps, IGetDataResponse>(Error, {
        dataField: "getArchivedTrackables",
        getQuery: (props) => props.data,
    }),
    withOffline<IArchivedTrackableListContainerProps, IGetDataResponse>(
        Offline,
        {
            dataField: "getArchivedTrackables",
            getQuery: (props) => props.data,
        },
    ),
    withRefresh<IArchivedTrackableListContainerProps, IGetDataResponse>({
        dataField: "getArchivedTrackables",
        getQuery: (props) => props.data,
        isMyData: (props) => isMyId(props.userId, props.session),
        isReadonlyData: (props) => false,
    }),
    withEmptyList<IArchivedTrackableListContainerProps>(
        EmptyList, (props) => props.data.getArchivedTrackables),
    withLoadMore<IArchivedTrackableListContainerProps, IGetDataResponse>({
        analyticsContext: AnalyticsContext.ArchivePage,
        dataField: "getArchivedTrackables",
        getQuery: (props) => props.data,
    }),
)(ArchivedTrackableListContainer);

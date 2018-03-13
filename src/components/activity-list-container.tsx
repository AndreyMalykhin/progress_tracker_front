import ActivityList, {
    IActivityListItemNode,
    IActivityListSection,
} from "components/activity-list";
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
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { RouteComponentProps, withRouter } from "react-router";
import { IConnection } from "utils/connection";
import defaultId from "utils/default-id";
import QueryStatus from "utils/query-status";
import routes from "utils/routes";

interface IActivityListContainerProps extends
    IOwnProps,
    IWithRefreshProps,
    IWithLoadMoreProps,
    IWithDIContainerProps,
    IWithSyncStatusProps {
    audience: Audience;
    data: QueryProps & IGetDataResponse;
}

interface IRouteParams {
    audience: Audience;
}

interface IOwnProps extends
    RouteComponentProps<IRouteParams>,
    IWithFetchPolicyProps,
    IWithNetworkStatusProps,
    IWithSessionProps {
    audience: Audience;
}

interface IGetDataResponse {
    getActivities: IConnection<IActivityListItemNode, number>;
}

const getDataQuery = gql`
query GetData($audience: Audience!, $skipUser: Boolean!, $cursor: Float) {
    getActivities(
        audience: $audience, after: $cursor
    ) @connection(key: "getActivities", filter: ["audience"]) {
        edges {
            node {
                id
                date
                user @skip(if: $skipUser) {
                    id
                    name
                    avatarUrlSmall
                }
                ... on ITrackableActivity {
                    trackable {
                        id
                        title
                    }
                }
                ... on CounterProgressChangedActivity {
                    delta
                }
                ... on NumericalGoalProgressChangedActivity {
                    delta
                }
                ... on TaskGoalProgressChangedActivity {
                    task {
                        id
                        title
                    }
                }
                ... on GymExerciseEntryAddedActivity {
                    entry {
                        id
                        setCount
                        repetitionCount
                        weight
                    }
                }
                ... on GoalApprovedActivity {
                    ratingDelta
                }
                ... on ExternalGoalReviewedActivity {
                    trackable {
                        user {
                            id
                            name
                        }
                    }
                    isApprove
                    ratingDelta
                }
            }
            cursor
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
    IActivityListContainerProps
>(
    getDataQuery,
    {
        options: (ownProps) => {
            const { audience, session, fetchPolicy } = ownProps;
            return {
                fetchPolicy,
                notifyOnNetworkStatusChange: true,
                variables: { audience, skipUser: audience === Audience.Me },
            };
        },
        skip: (ownProps: IOwnProps) => !ownProps.session.userId,
    },
);

class ActivityListContainer extends
    React.Component<IActivityListContainerProps> {
    private sections: IActivityListSection[] = [];

    public render() {
        const { audience, data, isRefreshing, onLoadMore, onRefresh } =
            this.props;
        return (
            <ActivityList
                isRefreshing={isRefreshing}
                sections={this.sections}
                audience={audience}
                queryStatus={data.networkStatus}
                onPressUser={this.onPressUser}
                onEndReached={onLoadMore}
                onRefresh={onRefresh}
            />
        );
    }

    public componentWillMount() {
        this.initSections(this.props);
    }

    public componentWillReceiveProps(nextProps: IActivityListContainerProps) {
        if (this.props.data.getActivities.edges !==
                nextProps.data.getActivities.edges
        ) {
            this.initSections(nextProps);
        }
    }

    private initSections(props: IActivityListContainerProps) {
        this.sections = [];
        const date = new Date();
        let sectionTimestamp = 0;
        let section: IActivityListSection;

        for (const activity of props.data.getActivities.edges) {
            date.setTime(activity.node.date);
            const activityTimestamp = date.setUTCHours(0, 0, 0, 0);

            if (activityTimestamp !== sectionTimestamp) {
                sectionTimestamp = activityTimestamp;
                section = {
                    data: [],
                    date: sectionTimestamp,
                    key: String(sectionTimestamp),
                };
                this.sections.push(section);
            }

            section!.data.push(activity);
        }
    }

    private onPressUser = (id: string) => {
        this.props.history.push(
            routes.profileActiveTrackables.path.replace(":id", id));
    }
}

export default compose(
    withDIContainer,
    withSession,
    withLogin<IActivityListContainerProps>(
        "activityList.loginToSeeFriends",
        (props) => props.audience === Audience.Friends,
    ),
    withRouter,
    withNetworkStatus,
    withSyncStatus,
    withFetchPolicy<IActivityListContainerProps>({
        getNamespace: (props) => props.audience,
        isMyData: (props) => props.audience === Audience.Me,
        isReadonlyData: (props) => false,
    }),
    withData,
    withNoUpdatesInBackground,
    withLoader<IActivityListContainerProps, IGetDataResponse>(Loader, {
        dataField: "getActivities",
        getQuery: (props) => props.data,
    }),
    withError<IActivityListContainerProps, IGetDataResponse>(Error, {
        dataField: "getActivities",
        getQuery: (props) => props.data,
    }),
    withOffline<IActivityListContainerProps, IGetDataResponse>(Offline, {
        dataField: "getActivities",
        getQuery: (props) => props.data,
    }),
    withRefresh<IActivityListContainerProps, IGetDataResponse>({
        dataField: "getActivities",
        getQuery: (props) => props.data,
        isMyData: (props) => props.audience === Audience.Me,
        isReadonlyData: (props) => false,
    }),
    withEmptyList<IActivityListContainerProps>(
        EmptyList, (props) => props.data.getActivities.edges),
    withLoadMore<IActivityListContainerProps, IGetDataResponse>({
        dataField: "getActivities",
        getQuery: (props) => props.data,
    }),
)(ActivityListContainer);

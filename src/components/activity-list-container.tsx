import ActivityList, {
    IActivityListItemNode,
    IActivityListSection,
} from "components/activity-list";
import EmptyList from "components/empty-list";
import Error from "components/error";
import Loader from "components/loader";
import withEmptyList from "components/with-empty-list";
import withError from "components/with-error";
import withLoader from "components/with-loader";
import withLogin, { IWithLoginProps } from "components/with-login";
import withNoUpdatesInBackground from "components/with-no-updates-in-background";
import withRefetchOnFirstLoad, {
    IWithRefetchOnFirstLoadProps,
} from "components/with-refetch-on-first-load";
import gql from "graphql-tag";
import Audience from "models/audience";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { RouteComponentProps, withRouter } from "react-router";
import { IConnection } from "utils/connection";
import getDataOrQueryStatus from "utils/get-data-or-query-status";
import QueryStatus from "utils/query-status";
import routes from "utils/routes";
import withLoadMore from "./with-load-more";

interface IActivityListContainerProps extends IOwnProps, IWithLoginProps {
    audience: Audience;
    data: QueryProps & IGetDataResponse;
    onLoadMore: () => void;
}

interface IRouteParams {
    audience: Audience;
}

interface IOwnProps extends
    RouteComponentProps<IRouteParams>, IWithRefetchOnFirstLoadProps {
    audience: Audience;
}

interface IGetDataResponse {
    getActivitiesByAudience: IConnection<IActivityListItemNode, number>;
}

const getDataQuery = gql`
query GetData($audience: Audience!, $skipUser: Boolean!, $cursor: Float) {
    getActivitiesByAudience(
        audience: $audience, after: $cursor
    ) @connection(key: "getActivitiesByAudience", filter: ["audience"]) {
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
                        ... on IPrimitiveTrackable {
                            title
                        }
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
            const { audience, fetchPolicy } = ownProps;
            return {
                fetchPolicy,
                notifyOnNetworkStatusChange: true,
                variables: { audience, skipUser: audience === Audience.Me },
            };
        },
        props: ({ data }) => {
            return getDataOrQueryStatus(data!);
        },
    },
);

class ActivityListContainer extends
    React.Component<IActivityListContainerProps> {
    private sections: IActivityListSection[] = [];

    public render() {
        const { audience, data, onLoadMore } = this.props;
        return (
            <ActivityList
                sections={this.sections}
                audience={audience}
                queryStatus={data.networkStatus}
                onPressUser={this.onPressUser}
                onEndReached={onLoadMore}
            />
        );
    }

    public componentWillMount() {
        this.initSections(this.props);
    }

    public componentWillReceiveProps(nextProps: IActivityListContainerProps) {
        if (this.props.data.getActivitiesByAudience.edges !==
                nextProps.data.getActivitiesByAudience.edges
        ) {
            this.initSections(nextProps);
        }
    }

    private initSections(props: IActivityListContainerProps) {
        this.sections = [];
        const date = new Date();
        let sectionTimestamp = 0;
        let section: IActivityListSection;

        for (const activity of props.data.getActivitiesByAudience.edges) {
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
    withLogin<IActivityListContainerProps>(
        "activityList.loginToSeeFriends",
        (props) => props.audience === Audience.Friends,
    ),
    withRouter,
    withRefetchOnFirstLoad<IActivityListContainerProps>(
        (props) => props.audience),
    withData,
    withNoUpdatesInBackground,
    withLoader(Loader, 512),
    withError(Error),
    withEmptyList<IActivityListContainerProps>(
        EmptyList, (props) => props.data.getActivitiesByAudience.edges),
    withLoadMore<IActivityListContainerProps, IGetDataResponse>(
        "getActivitiesByAudience", (props) => props.data),
)(ActivityListContainer);

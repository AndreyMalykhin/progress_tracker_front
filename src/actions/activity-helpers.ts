import { DataProxy } from "apollo-cache";
import { DocumentNode } from "graphql";
import gql from "graphql-tag";
import Audience from "models/audience";
import Type from "models/type";
import { IConnection, spliceConnection } from "utils/connection";
import dataIdFromObject from "utils/data-id-from-object";
import makeLog from "utils/make-log";

interface IGoalAchievedActivityFragment extends IAddActivityFragment {
    trackable: {
        __typename: Type;
        id: string;
    };
}

interface IAddTrackableAddedActivityFragment extends IAddActivityFragment {
    trackable: {
        __typename: Type;
        id: string;
    };
}

interface IAddActivityFragment {
    __typename: Type;
    id: string;
    date: number;
    user: {
        __typename: Type;
        id: string;
    };
}

interface ISpliceActivitiesFragment {
    __typename: Type;
    id: string;
    date: number;
}

interface IGetActivitiesResponse {
    getActivities: IConnection<ISpliceActivitiesFragment, number>;
}

const log = makeLog("activity-helpers");

const getActivitiesQuery = gql`
query GetActivities($audience: Audience!) {
    getActivities(audience: $audience) @connection(
        key: "getActivities", filter: ["audience"]
    ) {
        edges {
            cursor
            node {
                id
                date
            }
        }
        pageInfo {
            hasNextPage
            endCursor
        }
    }
}`;

const initActivitiesQuery = gql`
query GetActivities($audience: Audience!) {
    getActivities(audience: $audience) @connection(
        key: "getActivities", filter: ["audience"]
    ) {
        edges {
            cursor
        }
        pageInfo {
            hasNextPage
            endCursor
        }
    }
}`;

const trackableAddedActivityFragment = gql`
fragment AddTrackableAddedActivityFragment on TrackableAddedActivity {
    id
    date
    user {
        id
    }
    trackable {
        id
    }
}`;

const goalAchievedActivityFragment = gql`
fragment GoalAchievedActivityFragment on GoalAchievedActivity {
    id
    date
    user {
        id
    }
    trackable {
        id
    }
}`;

function prependTrackableAddedActivity(
    activity: IAddTrackableAddedActivityFragment, apollo: DataProxy,
) {
    prependActivity(activity, trackableAddedActivityFragment, apollo);
}

function prependGoalAchievedActivity(
    activity: IGoalAchievedActivityFragment, apollo: DataProxy,
) {
    prependActivity(activity, goalAchievedActivityFragment, apollo);
}

function prependActivity<T extends IAddActivityFragment>(
    activity: T, fragment: DocumentNode, apollo: DataProxy,
) {
    apollo.writeFragment({
        data: activity,
        fragment,
        id: dataIdFromObject(activity)!,
    });
    const activitiesToPrepend = [activity];
    const sort = false;
    spliceActivities([], activitiesToPrepend, [], Audience.Me, sort, apollo);
}

function spliceActivities(
    idsToRemove: string[],
    activitiesToPrepend: ISpliceActivitiesFragment[],
    activitiesToAppend: ISpliceActivitiesFragment[],
    audience: Audience,
    sort: boolean,
    apollo: DataProxy,
) {
    const activitiesResponse = getActivities(audience, apollo);

    if (!activitiesResponse) {
        return;
    }

    const cursorField = "date";
    spliceConnection(
        activitiesResponse.getActivities,
        idsToRemove,
        activitiesToPrepend,
        activitiesToAppend,
        cursorField,
        Type.ActivityEdge,
        sort,
        compareActivities,
    );
    setActivities(activitiesResponse, audience, apollo);
}

function getActivities(audience: Audience, apollo: DataProxy) {
    try {
        return apollo.readQuery<IGetActivitiesResponse>(
            { query: getActivitiesQuery, variables: { audience }})!;
    } catch (e) {
        log.trace("getActivities(); no data");
        return null;
    }
}

function setActivities(
    activitiesResponse: IGetActivitiesResponse,
    audience: Audience,
    apollo: DataProxy,
) {
    apollo.writeQuery({
        data: activitiesResponse,
        query: getActivitiesQuery,
        variables: { audience },
    });
}

function compareActivities(
    lhs: ISpliceActivitiesFragment, rhs: ISpliceActivitiesFragment,
) {
    const result = rhs.date - lhs.date;

    if (result === 0) {
        return 0;
    }

    return result < 0 ? -1 : 1;
}

function initActivities(apollo: DataProxy) {
    const data = {
        __typename: Type.Query,
        getActivities: {
            __typename: Type.ActivityConnection,
            edges: [],
            pageInfo: {
                __typename: Type.PageInfo,
                endCursor: null,
                hasNextPage: false,
            },
        },
    };
    apollo.writeQuery({
        data,
        query: initActivitiesQuery,
        variables: { audience: Audience.Me },
    });
}

export {
    getActivities,
    initActivities,
    spliceActivities,
    prependTrackableAddedActivity,
    prependGoalAchievedActivity,
    prependActivity,
    IAddActivityFragment,
    ISpliceActivitiesFragment,
};

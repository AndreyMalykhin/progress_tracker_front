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
    getActivitiesByAudience: IConnection<ISpliceActivitiesFragment, number>;
}

const log = makeLog("activity-helpers");

const getActivitiesQuery = gql`
query GetActivities($audience: Audience!) {
    getActivitiesByAudience(audience: $audience) @connection(
        key: "getActivitiesByAudience", filter: ["audience"]
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

function addTrackableAddedActivity(
    activity: IAddTrackableAddedActivityFragment, apollo: DataProxy,
) {
    addActivity(activity, trackableAddedActivityFragment, apollo);
}

function addGoalAchievedActivity(
    activity: IGoalAchievedActivityFragment, apollo: DataProxy,
) {
    addActivity(activity, goalAchievedActivityFragment, apollo);
}

function addActivity<T extends IAddActivityFragment>(
    activity: T, fragment: DocumentNode, apollo: DataProxy,
) {
    apollo.writeFragment({
        data: activity,
        fragment,
        id: dataIdFromObject(activity)!,
    });
    const idsToRemove: string[] = [];
    const activitiesToAdd = [activity];
    spliceActivities(idsToRemove, activitiesToAdd, Audience.Me, apollo);
}

function spliceActivities(
    idsToRemove: string[],
    activitiesToAdd: ISpliceActivitiesFragment[],
    audience: Audience,
    apollo: DataProxy,
) {
    const activitiesResponse = getActivities(audience, apollo);

    if (!activitiesResponse) {
        return;
    }

    const cursorField = "date";
    spliceConnection(
        activitiesResponse.getActivitiesByAudience,
        idsToRemove,
        activitiesToAdd,
        cursorField,
        Type.ActivityEdge,
        compareActivities,
    );
    setActivities(activitiesResponse, audience, apollo);
}

function getActivities(audience: Audience, apollo: DataProxy) {
    try {
        return apollo.readQuery<IGetActivitiesResponse>(
            { query: getActivitiesQuery, variables: { audience }})!;
    } catch (e) {
        log("getActivities(); no data");
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

export {
    spliceActivities,
    addTrackableAddedActivity,
    addGoalAchievedActivity,
    addActivity,
    IAddActivityFragment,
};

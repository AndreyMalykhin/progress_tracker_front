import { addActivity } from "actions/activity-helpers";
import { spliceArchivedTrackables } from "actions/archived-trackables-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { NetInfo } from "react-native";
import { IConnection } from "utils/connection";
import dataIdFromObject from "utils/data-id-from-object";
import makeLog from "utils/make-log";
import myId from "utils/my-id";
import uuid from "utils/uuid";

interface IActiveTrackableFragment {
    __typename: Type;
    id: string;
    deadlineDate?: number;
    status: TrackableStatus;
    statusChangeDate?: number;
}

interface IExpiredTrackableFragment extends IActiveTrackableFragment {
    statusChangeDate: number;
}

interface IGetActiveTrackablesResponse {
    getActiveTrackables: IConnection<IActiveTrackableFragment, number>;
}

const log = makeLog("deadline-tracker");

const getActiveTrackablesQuery = gql`
query GetActiveTrackables($userId: ID!) {
    getActiveTrackables(userId: $userId) @connection(
        key: "getActiveTrackables", filter: ["userId"]
    ) {
        edges {
            node {
                id
                status
                statusChangeDate
                ... on IGoal {
                    deadlineDate
                }
            }
        }
    }
}`;

const activityFragment = gql`
fragment GoalExpiredActivityFragment on GoalExpiredActivity {
    id
    date
    trackable {
        id
    }
    user {
        id
    }
}`;

const millisecondsInHour = 1 * 60 * 1000;

class DeadlineTracker {
    private apollo: ApolloClient<NormalizedCacheObject>;

    public constructor(apollo: ApolloClient<NormalizedCacheObject>) {
        this.apollo = apollo;
    }

    public async start() {
        if (!await NetInfo.isConnected.fetch()) {
            this.tick();
        }

        setInterval(this.tick, millisecondsInHour);
    }

    private tick = () => {
        log("tick()");
        const activeTrackablesResponse = this.getActiveTrackables();

        if (!activeTrackablesResponse) {
            return;
        }

        const activeTrackables =
            activeTrackablesResponse.getActiveTrackables.edges;
        const date = Date.now();
        const expiredTrackables: IExpiredTrackableFragment[] = [];

        for (const activeTrackableEdge of activeTrackables) {
            const activeTrackable = activeTrackableEdge.node;

            if (!activeTrackable.deadlineDate
                || date < activeTrackable.deadlineDate
            ) {
                continue;
            }

            this.expire(activeTrackable);
            expiredTrackables.push(
                activeTrackable as IExpiredTrackableFragment);
        }

        if (!expiredTrackables.length) {
            return;
        }

        this.removeExpiredTrackablesFromActive(activeTrackablesResponse);
        this.addTrackablesToExpired(expiredTrackables);

        for (const expiredTrackable of expiredTrackables) {
            this.addExpirationActivity(expiredTrackable);
        }
    }

    private getActiveTrackables() {
        try {
            return this.apollo.readQuery<IGetActiveTrackablesResponse>({
                query: getActiveTrackablesQuery,
                variables: { userId: myId },
            });
        } catch (e) {
            log("getActiveTrackables(); no data");
            return null;
        }
    }

    private expire(trackable: IActiveTrackableFragment) {
        log("expire(); trackable=%o", trackable);
        trackable.status = TrackableStatus.Expired;
        trackable.statusChangeDate = Date.now();
    }

    private removeExpiredTrackablesFromActive(
        response: IGetActiveTrackablesResponse,
    ) {
        const activeTrackables = response.getActiveTrackables.edges;

        for (let i = activeTrackables.length - 1; i >= 0; --i) {
            if (activeTrackables[i].node.status === TrackableStatus.Expired) {
                activeTrackables.splice(i, 1);
            }
        }

        this.apollo.writeQuery({
            data: response,
            query: getActiveTrackablesQuery,
            variables: { userId: myId },
        });
    }

    private addTrackablesToExpired(trackables: IExpiredTrackableFragment[]) {
        const idsToRemove: string[] = [];
        spliceArchivedTrackables(
            idsToRemove, trackables, TrackableStatus.Expired, this.apollo);
    }

    private addExpirationActivity(trackable: IExpiredTrackableFragment) {
        const activity = {
            __typename: Type.GoalExpiredActivity,
            date: Date.now(),
            id: uuid(),
            trackable,
            user: {
                __typename: Type.User,
                id: myId,
            },
        };
        addActivity(activity, activityFragment, this.apollo);
    }
}

export default DeadlineTracker;
import {
    removeActiveTrackables,
} from "actions/active-trackables-helpers";
import { prependActivity } from "actions/activity-helpers";
import { prependArchivedTrackables } from "actions/archived-trackables-helpers";
import { getSession } from "actions/session-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { InteractionManager } from "react-native";
import { IConnection } from "utils/connection";
import dataIdFromObject from "utils/data-id-from-object";
import { IEnvConfig } from "utils/env-config";
import makeLog from "utils/make-log";
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
query GetActiveTrackables($userId: ID) {
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

const trackableFragment = gql`
fragment TrackableFragment on ITrackable {
    id
    status
    statusChangeDate
}`;

class DeadlineTracker {
    private apollo: ApolloClient<NormalizedCacheObject>;
    private envConfig: IEnvConfig;

    public constructor(
        apollo: ApolloClient<NormalizedCacheObject>, envConfig: IEnvConfig,
    ) {
        this.apollo = apollo;
        this.envConfig = envConfig;
    }

    public async start() {
        this.tick();
        setInterval(() => {
            InteractionManager.runAfterInteractions(() => this.tick());
        }, this.envConfig.deadlineWatchPeriod);
    }

    private tick() {
        log.trace("tick()");

        if (!getSession(this.apollo).userId) {
            return;
        }

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

        this.removeTrackablesFromActive(expiredTrackables);
        this.addTrackablesToExpired(expiredTrackables);

        for (const expiredTrackable of expiredTrackables) {
            this.addExpirationActivity(expiredTrackable);
        }

        // TODO add toast
    }

    private getActiveTrackables() {
        try {
            return this.apollo.readQuery<IGetActiveTrackablesResponse>({
                query: getActiveTrackablesQuery,
            });
        } catch (e) {
            log.trace("getActiveTrackables(); no data");
            return null;
        }
    }

    private expire(trackable: IActiveTrackableFragment) {
        log.trace("expire(); trackable=%o", trackable);
        trackable.status = TrackableStatus.Expired;
        trackable.statusChangeDate = Date.now();
        this.apollo.writeFragment({
            data: trackable,
            fragment: trackableFragment,
            id: dataIdFromObject(trackable)!,
        });
    }

    private removeTrackablesFromActive(
        trackables: IExpiredTrackableFragment[],
    ) {
        const idsToRemove = trackables.map((trackable) => trackable.id);
        removeActiveTrackables(idsToRemove, this.apollo);
    }

    private addTrackablesToExpired(trackables: IExpiredTrackableFragment[]) {
        prependArchivedTrackables(
            trackables, TrackableStatus.Expired, this.apollo);
    }

    private addExpirationActivity(trackable: IExpiredTrackableFragment) {
        const activity = {
            __typename: Type.GoalExpiredActivity,
            date: Date.now(),
            id: uuid(),
            trackable,
            user: {
                __typename: Type.User,
                id: getSession(this.apollo).userId!,
            },
        };
        prependActivity(activity, activityFragment, this.apollo);
    }
}

export default DeadlineTracker;

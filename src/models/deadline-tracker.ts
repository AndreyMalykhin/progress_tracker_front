import {
    removeActiveTrackables,
} from "actions/active-trackables-helpers";
import { prependActivity } from "actions/activity-helpers";
import {
    ISetChildStatusAggregateFragment,
    setChildStatus,
    setChildStatusFragment,
} from "actions/aggregate-helpers";
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
    deadlineDate: number | null;
    status: TrackableStatus;
    statusChangeDate: number | null;
    parent: { id: string; } | null;
}

interface IAggregateFragment extends IActiveTrackableFragment {
    children: IActiveTrackableFragment[];
}

interface IExpiredTrackableFragment extends IActiveTrackableFragment {
    deadlineDate: number;
    statusChangeDate: number;
}

interface IGetActiveTrackablesResponse {
    getActiveTrackables: IConnection<IActiveTrackableFragment, number>;
}

const log = makeLog("deadline-tracker");

const getActiveTrackablesQuery = gql`
fragment DeadlineTrackerActiveTrackableFragment on ITrackable {
    id
    status
    statusChangeDate
    ... on IGoal {
        deadlineDate
    }
    ... on IAggregatable {
        parent {
            id
        }
    }
}

query GetActiveTrackables($userId: ID) {
    getActiveTrackables(userId: $userId) @connection(
        key: "getActiveTrackables", filter: ["userId"]
    ) {
        edges {
            node {
                ...DeadlineTrackerActiveTrackableFragment
                ... on Aggregate {
                    children {
                        ...DeadlineTrackerActiveTrackableFragment
                    }
                }
            }
        }
    }
}`;

const activityFragment = gql`
fragment DeadlineTrackerGoalExpiredActivityFragment on GoalExpiredActivity {
    id
    date
    trackable {
        id
    }
    user {
        id
    }
}`;

const expiredTrackableFragment = gql`
fragment DeadlineTrackerExpiredTrackableFragment on ITrackable {
    id
    status
    statusChangeDate
    ... on IAggregatable {
        parent {
            id
        }
    }
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
        log.trace("tick");

        if (!getSession(this.apollo).userId) {
            return;
        }

        const activeTrackablesResponse = this.getActiveTrackables();

        if (!activeTrackablesResponse) {
            return;
        }

        const { expiredTrackables, removedAggregateIds } =
            this.tryExpireTrackables(activeTrackablesResponse);

        if (!expiredTrackables.length) {
            return;
        }

        this.removeTrackablesFromActive(expiredTrackables, removedAggregateIds);
        this.addTrackablesToExpired(expiredTrackables);

        for (const expiredTrackable of expiredTrackables) {
            this.addExpirationActivity(expiredTrackable);
        }

        // TODO toast ?
    }

    private getActiveTrackables() {
        try {
            return this.apollo.readQuery<IGetActiveTrackablesResponse>({
                query: getActiveTrackablesQuery,
            });
        } catch (e) {
            log.trace("getActiveTrackables", "no data");
            return null;
        }
    }

    private tryExpireTrackables(
        activeTrackablesResponse: IGetActiveTrackablesResponse,
    ) {
        const expiredTrackables: IExpiredTrackableFragment[] = [];
        const removedAggregateIds: string[] = [];
        const { edges } = activeTrackablesResponse.getActiveTrackables;

        for (const { node } of edges) {
            if (node.__typename === Type.Aggregate) {
                const aggregate = node as IAggregateFragment;

                for (const child of aggregate.children) {
                    if (child.status === TrackableStatus.Active
                        || child.status === TrackableStatus.PendingProof
                    ) {
                        this.tryExpireTrackable(child, aggregate,
                            expiredTrackables, removedAggregateIds);
                    }
                }
            } else {
                const aggregate = undefined;
                this.tryExpireTrackable(
                    node, aggregate, expiredTrackables, removedAggregateIds);
            }
        }

        return { expiredTrackables, removedAggregateIds };
    }

    private tryExpireTrackable(
        trackable: IActiveTrackableFragment,
        aggregate: IAggregateFragment | undefined,
        expiredTrackables: IExpiredTrackableFragment[],
        removedAggregateIds: string[],
    ) {
        if (!trackable.deadlineDate
            || Date.now() < trackable.deadlineDate
        ) {
            return;
        }

        if (this.expire(trackable, aggregate) && aggregate) {
            removedAggregateIds.push(aggregate.id);
        }

        expiredTrackables.push(trackable as IExpiredTrackableFragment);
    }

    private expire(
        trackable: IActiveTrackableFragment,
        aggregate: IAggregateFragment | undefined,
    ) {
        log.trace("expire", "trackable=%o", trackable);
        trackable.status = TrackableStatus.Expired;
        trackable.statusChangeDate = Date.now();
        let isAggregateRemoved = false;

        if (aggregate
            && !setChildStatus(aggregate, trackable, trackable.status)
        ) {
            isAggregateRemoved = true;
            (trackable as IExpiredTrackableFragment).parent = null;
        }

        this.apollo.writeFragment({
            data: trackable,
            fragment: expiredTrackableFragment,
            id: dataIdFromObject(trackable)!,
        });
        return isAggregateRemoved;
    }

    private removeTrackablesFromActive(
        expiredTrackables: IExpiredTrackableFragment[], aggregateIds: string[],
    ) {
        const idsToRemove = expiredTrackables.map((trackable) => trackable.id)
            .concat(aggregateIds);
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

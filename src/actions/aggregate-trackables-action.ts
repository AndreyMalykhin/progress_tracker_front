import { spliceActiveTrackables } from "actions/active-trackables-helpers";
import { getProgress } from "actions/aggregate-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";
import myId from "utils/my-id";
import uuid from "utils/uuid";

interface IAggregateTrackablesResponse {
    aggregateTrackables: {
        isNewTrackable: boolean;
        trackable: {
            __typename: Type;
            id: string;
            progress: number;
            maxProgress?: number;
            status: TrackableStatus;
            statusChangeDate?: number|null;
            creationDate: number;
            order: number;
            isPublic: boolean;
            children: Array<{
                id: string;
                parent: {
                    __typename: Type;
                    id: string;
                };
            }>;
        }
    };
}

interface ITrackable {
    __typename: Type;
    id: string;
    progress: number;
    maxProgress?: number;
    order: number;
    isPublic: boolean;
    creationDate: number;
    parent?: {
        __typename: Type;
        id: string;
    };
}

interface IGetTrackablesByIdsResponse {
    getTrackablesByIds: Array<ITrackable & {
        children?: ITrackable[];
    }>;
}

const aggregateTrackablesQuery = gql`
mutation AggregateTrackables($ids: [ID!]!) {
    aggregateTrackables(ids: $ids) {
        isNewTrackable
        trackable {
            id
            status
            statusChangeDate
            creationDate
            progress
            maxProgress
            order
            isPublic
            children {
                id
                ... on IAggregatable {
                    parent {
                        id
                    }
                }
            }
        }
    }
}`;

const getTrackablesByIdsQuery = gql`
query GetTrackablesByIds($ids: [ID!]!) {
    getTrackablesByIds(ids: $ids) {
        id
        isPublic
        ... on Counter {
            progress
        }
        ... on TaskGoal {
            progress
            maxProgress
        }
        ... on NumericalGoal {
            progress
            maxProgress
        }
        ... on Aggregate {
            order
            children {
                id
                isPublic
                ... on Counter {
                    progress
                }
                ... on TaskGoal {
                    progress
                    maxProgress
                }
                ... on NumericalGoal {
                    progress
                    maxProgress
                }
            }
        }
    }
}`;

async function aggregateTrackables(
    ids: string[],
    mutate: MutationFunc<IAggregateTrackablesResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(ids, apollo),
        update: (proxy, response) => {
            updateActiveTrackables(response.data, proxy);
        },
        variables: { ids },
    });
}

function updateActiveTrackables(
    response: IAggregateTrackablesResponse, apollo: DataProxy,
) {
    const { trackable, isNewTrackable } = response.aggregateTrackables;
    const trackablesToAdd = [];
    const idsToRemove = trackable.children.map((child) => child.id);

    if (isNewTrackable) {
        trackablesToAdd.push(trackable);
    }

    spliceActiveTrackables(idsToRemove, trackablesToAdd, apollo);
}

function getOptimisticResponse(
    targetIds: string[], apollo: ApolloClient<NormalizedCacheObject>,
) {
    let aggregateId = "";
    let order = 0;
    let isPublic = false;
    let creationDate;
    let children: ITrackable[] = [];
    const targetTrackables = apollo.readQuery<IGetTrackablesByIdsResponse>({
        query: getTrackablesByIdsQuery,
        variables: { ids: targetIds },
    })!.getTrackablesByIds;

    for (const targetTrackable of targetTrackables) {
        if (targetTrackable.__typename === Type.Aggregate) {
            aggregateId = targetTrackable.id;
            order = targetTrackable.order;
            isPublic = targetTrackable.isPublic;
            creationDate = targetTrackable.creationDate;
            children = targetTrackable.children!.concat(children);
        } else {
            children.push(targetTrackable);
        }

    }

    const { current: progress, max: maxProgress } = getProgress(children);
    let isNewTrackable = false;

    if (!aggregateId) {
        isNewTrackable = true;
        aggregateId = uuid();
        creationDate = Date.now();
        order = creationDate;
    }

    for (const child of children) {
        child.parent = { __typename: Type.Aggregate, id: aggregateId };
        isPublic = isPublic || child.isPublic;
    }

    return {
        __typename: Type.Mutation,
        aggregateTrackables: {
            __typename: Type.AggregateTrackablesResponse,
            isNewTrackable,
            trackable: {
                __typename: Type.Aggregate,
                children,
                creationDate,
                id: aggregateId,
                isPublic,
                maxProgress: maxProgress === undefined ? null : maxProgress,
                order,
                progress,
                status: TrackableStatus.Active,
                statusChangeDate: null,
            },
        },
    } as IAggregateTrackablesResponse;
}

export {
    aggregateTrackables,
    aggregateTrackablesQuery,
    IAggregateTrackablesResponse,
};

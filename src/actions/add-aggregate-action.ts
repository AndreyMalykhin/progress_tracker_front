import { spliceActiveTrackables } from "actions/active-trackables-helpers";
import { getProgress } from "actions/aggregate-helpers";
import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { MutationFunc } from "react-apollo";
import uuid from "utils/uuid";

interface IAddAggregateResponse {
    addAggregate: {
        trackable: {
            __typename: Type;
            id: string;
            title: string;
            progress: number;
            maxProgress?: number;
            status: TrackableStatus;
            statusChangeDate?: number|null;
            creationDate: number;
            order: number;
            isPublic: boolean;
            user: {
                id: string;
            };
            children: Array<{
                id: string;
                parent: {
                    __typename: Type;
                    id: string;
                };
            }>;
        };
    };
}

interface IAddAggregateFragment {
    title: string;
    childIds: string[];
}

interface IGetTrackablesByIdsResponse {
    getTrackables: Array<{
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
    }>;
}

const getTrackablesQuery = gql`
query getTrackables($ids: [ID!]!) {
    getTrackables(ids: $ids) {
        id
        isPublic
        ... on Counter {
            progress
        }
        ... on IGoal {
            progress
            maxProgress
        }
    }
}`;

const addAggregateQuery = gql`
mutation AddAggregate($aggregate: AddAggregateInput!) {
    addAggregate(aggregate: $aggregate) {
        trackable {
            id
            title,
            status
            statusChangeDate
            creationDate
            progress
            maxProgress
            order
            isPublic
            user {
                id
            }
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

async function addAggregate(
    aggregate: IAddAggregateFragment,
    mutate: MutationFunc<IAddAggregateResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const optimisticResponse = getOptimisticResponse(aggregate, apollo);
    const result = await mutate({
        optimisticResponse,
        update: (proxy, response) => {
            updateActiveTrackables(
                response.data as IAddAggregateResponse, proxy);
        },
        variables: {
            aggregate: {
                children: aggregate.childIds.map((childId) => {
                    return { id: childId };
                }),
                id: optimisticResponse.addAggregate.trackable.id,
                title: aggregate.title,
            },
        },
    });
    return result.data as IAddAggregateResponse;
}

function updateActiveTrackables(
    response: IAddAggregateResponse, apollo: DataProxy,
) {
    const { trackable } = response.addAggregate;
    const trackablesToPrepend = [trackable];
    const idsToRemove = trackable.children.map((child) => child.id);
    spliceActiveTrackables(idsToRemove, trackablesToPrepend, [], apollo);
}

function getOptimisticResponse(
    aggregate: IAddAggregateFragment, apollo: DataProxy,
) {
    const id = uuid();
    let isPublic = false;
    const children = apollo.readQuery<IGetTrackablesByIdsResponse>({
        query: getTrackablesQuery,
        variables: { ids: aggregate.childIds },
    })!.getTrackables;

    for (const child of children) {
        child.parent = { __typename: Type.Aggregate, id };
        isPublic = isPublic || child.isPublic;
    }

    const { current: progress, max: maxProgress } = getProgress(children);
    const user = { __typename: Type.User, id: getSession(apollo).userId };
    const creationDate = Date.now();
    return {
        __typename: Type.Mutation,
        addAggregate: {
            __typename: Type.AddAggregateResponse,
            trackable: {
                __typename: Type.Aggregate,
                children,
                creationDate,
                id,
                isPublic,
                maxProgress: maxProgress === undefined ? null : maxProgress,
                order: creationDate,
                progress,
                status: TrackableStatus.Active,
                statusChangeDate: null,
                title: aggregate.title,
                user,
            },
        },
    } as IAddAggregateResponse;
}

export {
    addAggregate,
    addAggregateQuery,
    IAddAggregateResponse,
    IAddAggregateFragment,
};

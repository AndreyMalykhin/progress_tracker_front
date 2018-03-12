import { removeActiveTrackables } from "actions/active-trackables-helpers";
import { getProgress } from "actions/aggregate-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo";

interface IAddToAggregateResponse {
    addToAggregate: {
        trackable: {
            __typename: Type;
            id: string;
            progress: number;
            maxProgress?: number;
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

interface IPrimitiveTrackable {
    __typename: Type;
    id: string;
    progress: number;
    maxProgress?: number;
    parent?: {
        __typename: Type;
        id: string;
    };
}

type IAggregate = IPrimitiveTrackable & {
    children: IPrimitiveTrackable[];
};

interface IGetTrackablesByIdsResponse {
    getTrackables: Array<IPrimitiveTrackable | IAggregate>;
}

const getTrackablesQuery = gql`
query getTrackables($ids: [ID!]!) {
    getTrackables(ids: $ids) {
        id
        ... on Counter {
            progress
        }
        ... on IGoal {
            progress
            maxProgress
        }
        ... on Aggregate {
            children {
                id
                ... on Counter {
                    progress
                }
                ... on IGoal {
                    progress
                    maxProgress
                }
            }
        }
    }
}`;

const addToAggregateQuery = gql`
mutation AddToAggregate($ids: [ID!]!, $aggregateId: ID!) {
    addToAggregate(ids: $ids, aggregateId: $aggregateId) {
        trackable {
            id
            progress
            maxProgress
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

async function addToAggregate(
    ids: string[],
    aggregateId: string,
    mutate: MutationFunc<IAddToAggregateResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const optimisticResponse = getOptimisticResponse(ids, aggregateId, apollo);
    const result = await mutate({
        optimisticResponse,
        update: (proxy, response) => {
            updateActiveTrackables(
                response.data as IAddToAggregateResponse, proxy);
        },
        variables: { aggregateId, ids },
    });
    return result.data as IAddToAggregateResponse;
}

function updateActiveTrackables(
    response: IAddToAggregateResponse, apollo: DataProxy,
) {
    const { trackable } = response.addToAggregate;
    const idsToRemove = trackable.children.map((child) => child.id);
    removeActiveTrackables(idsToRemove, apollo);
}

function getOptimisticResponse(
    idsToAdd: string[],
    aggregateId: string,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const trackables = apollo.readQuery<IGetTrackablesByIdsResponse>({
        query: getTrackablesQuery,
        variables: { ids: idsToAdd.concat(aggregateId) },
    })!.getTrackables;
    let aggregate: IAggregate;
    const childrenToAdd = [];

    for (const trackable of trackables) {
        if (trackable.id === aggregateId) {
            aggregate = trackable as IAggregate;
        } else {
            childrenToAdd.push(trackable);
        }
    }

    const { children } = aggregate!;
    children.unshift(...childrenToAdd);

    for (const child of children) {
        child.parent = { __typename: Type.Aggregate, id: aggregateId };
    }

    const { current: progress, max: maxProgress } = getProgress(children);
    return {
        __typename: Type.Mutation,
        addToAggregate: {
            __typename: Type.AddToAggregateResponse,
            trackable: {
                __typename: Type.Aggregate,
                children,
                id: aggregateId,
                maxProgress: maxProgress === undefined ? null : maxProgress,
                progress,
            },
        },
    } as IAddToAggregateResponse;
}

export { addToAggregate, addToAggregateQuery, IAddToAggregateResponse };

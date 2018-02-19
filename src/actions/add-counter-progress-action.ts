import { addActivity, spliceActivities } from "actions/activity-helpers";
import {
    IUpdateProgressFragment,
    updateProgress,
    updateProgressFragment,
} from "actions/aggregate-helpers";
import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Audience from "models/audience";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";
import uuid from "utils/uuid";

interface IAddCounterProgressResponse {
    addCounterProgress: {
        trackable: {
            id: string;
            progress: number;
            parent?: {
                id: string;
                progress: number;
            };
        };
    };
}

interface ICounterFragment {
    id: string;
    progress: number;
    parent?: IUpdateProgressFragment;
}

const counterFragment = gql`
${updateProgressFragment}

fragment AddCounterProgressCounterFragment on Counter {
    id
    progress
    parent {
        ...UpdateProgressAggregateFragment
    }
}`;

const addCounterProgressQuery = gql`
mutation AddCounterProgress($id: ID!, $value: Float!) {
    addCounterProgress(id: $id, value: $value) {
        trackable {
            ... on Counter {
                id
                progress
                parent {
                    id
                    progress
                }
            }
        }
    }
}`;

const activityFragment = gql`
fragment AddCounterProgressChangedActivityFragment on CounterProgressChangedActivity {
    id
    date
    delta
    trackable {
        id
    }
    user {
        id
    }
}`;

async function addCounterProgress(
    id: string,
    value: number,
    mutate: MutationFunc<IAddCounterProgressResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId = dataIdFromObject({ __typename: Type.Counter, id })!;
    const counter = apollo.readFragment<ICounterFragment>({
        fragment: counterFragment,
        fragmentName: "AddCounterProgressCounterFragment",
        id: fragmentId,
    })!;
    const prevProgress = counter.progress;
    return await mutate({
        optimisticResponse: getOptimisticResponse(counter, value, apollo),
        update: (proxy, response) => {
            updateActivities(
                prevProgress,
                response.data as IAddCounterProgressResponse,
                proxy,
            );
        },
        variables: { id, value },
    });
}

function updateActivities(
    prevProgress: number,
    response: IAddCounterProgressResponse,
    apollo: DataProxy,
) {
    const { trackable } = response.addCounterProgress;
    const activity = {
        __typename: Type.CounterProgressChangedActivity,
        date: Date.now(),
        delta: trackable.progress - prevProgress,
        id: uuid(),
        trackable,
        user: {
            __typename: Type.User,
            id: getSession(apollo).userId,
        },
    };
    addActivity(activity, activityFragment, apollo);
}

function getOptimisticResponse(
    counter: ICounterFragment,
    value: number,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    counter.progress += value;

    if (counter.parent) {
        updateProgress(counter.parent);
    }

    return {
        __typename: Type.Mutation,
        addCounterProgress: {
            __typename: Type.AddCounterProgressResponse,
            trackable: counter,
        },
    } as IAddCounterProgressResponse;
}

export {
    addCounterProgress,
    addCounterProgressQuery,
    IAddCounterProgressResponse,
};

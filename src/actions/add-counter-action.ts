import { prependActiveTrackables } from "actions/active-trackables-helpers";
import {
    prependTrackableAddedActivity,
} from "actions/activity-helpers";
import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import gql from "graphql-tag";
import Audience from "models/audience";
import Difficulty from "models/difficulty";
import ProgressDisplayMode from "models/progress-display-mode";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";
import uuid from "utils/uuid";

interface IAddCounterResponse {
    addCounter: {
        trackable: {
            __typename: Type;
            iconName: string;
            id: string;
            isPublic: boolean;
            order: number;
            parent: null;
            progress: number;
            status: TrackableStatus;
            statusChangeDate: null;
            creationDate: number;
            title: string;
            user: {
                __typename: Type;
                id: string;
            };
        };
    };
}

interface IAddCounterFragment {
    title: string;
    iconName: string;
    isPublic: boolean;
}

const addCounterQuery = gql`
mutation AddCounter($counter: AddCounterInput!) {
    addCounter(counter: $counter) {
        trackable {
            iconName
            id
            isPublic
            order
            parent {
                id
            }
            progress
            status
            statusChangeDate
            creationDate
            title
            user {
                id
            }
        }
    }
}`;

async function addCounter(
    counter: IAddCounterFragment,
    mutate: MutationFunc<IAddCounterResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const optimisticResponse = getOptimisticResponse(counter, apollo);
    return await mutate({
        optimisticResponse,
        update: (proxy, response) => {
            const responseData = response.data as IAddCounterResponse;
            updateActiveTrackables(responseData, proxy);
            updateActivities(responseData, proxy);
        },
        variables: {
            counter: {
                ...counter,
                id: optimisticResponse.addCounter.trackable.id,
            },
        },
    });
}

function updateActiveTrackables(
    response: IAddCounterResponse, apollo: DataProxy,
) {
    prependActiveTrackables([response.addCounter.trackable], apollo);
}

function updateActivities(response: IAddCounterResponse, apollo: DataProxy) {
    const { trackable } = response.addCounter;
    const activity = {
        __typename: Type.TrackableAddedActivity,
        date: Date.now(),
        id: uuid(),
        trackable,
        user: trackable.user,
    };
    prependTrackableAddedActivity(activity, apollo);
}

function getOptimisticResponse(
    counter: IAddCounterFragment, apollo: ApolloClient<NormalizedCacheObject>) {
    const currentDate = Date.now();
    return {
        __typename: Type.Mutation,
        addCounter: {
            __typename: Type.AddCounterResponse,
            trackable: {
                __typename: Type.Counter,
                creationDate: currentDate,
                iconName: counter.iconName,
                id: uuid(),
                isPublic: counter.isPublic,
                order: currentDate,
                parent: null,
                progress: 0,
                status: TrackableStatus.Active,
                statusChangeDate: null,
                title: counter.title,
                user: {
                    __typename: Type.User,
                    id: getSession(apollo).userId,
                },
            },
        },
    } as IAddCounterResponse;
}

export {
    addCounter,
    addCounterQuery,
    IAddCounterResponse,
    IAddCounterFragment,
};

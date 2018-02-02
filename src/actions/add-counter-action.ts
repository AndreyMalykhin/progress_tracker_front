import { spliceActiveTrackables } from "actions/active-trackables-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import gql from "graphql-tag";
import ProgressDisplayMode from "models/progress-display-mode";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import Difficulty from "utils/difficulty";
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
            title: string;
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
            title
        }
    }
}`;

async function addCounter(
    counter: IAddCounterFragment,
    mutate: MutationFunc<IAddCounterResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(counter),
        update: (proxy, response) => {
            updateActiveTrackables(response.data, proxy);
        },
        variables: { counter },
    });
}

function updateActiveTrackables(
    response: IAddCounterResponse, apollo: DataProxy,
) {
    const idsToRemove: string[] = [];
    const trackablesToAdd = [response.addCounter.trackable];
    spliceActiveTrackables(idsToRemove, trackablesToAdd, apollo);
}

function getOptimisticResponse(counter: IAddCounterFragment) {
    return {
        __typename: Type.Mutation,
        addCounter: {
            __typename: Type.AddCounterResponse,
            trackable: {
                __typename: Type.Counter,
                iconName: counter.iconName,
                id: uuid(),
                isPublic: counter.isPublic,
                order: Date.now(),
                parent: null,
                progress: 0,
                status: TrackableStatus.Active,
                statusChangeDate: null,
                title: counter.title,
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

import {
    getActiveTrackables,
    sortActiveTrackables,
} from "actions/active-trackables-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";
import makeLog from "utils/make-log";

interface IReorderTrackableResponse {
    reorderTrackable: {
        trackable: ITrackableFragment;
    };
}

interface ITrackableFragment {
    __typename: Type;
    id: string;
    order: number;
}

const log = makeLog("reorder-trackable-action");

const trackableFragment = gql`
fragment ReorderTrackableFragment on ITrackable {
    id
    order
}`;

const reorderTrackableQuery = gql`
${trackableFragment}

mutation ReorderTrackable($sourceId: ID!, $destinationId: ID!) {
    reorderTrackable(sourceId: $sourceId, destinationId: $destinationId) {
        trackable {
            ...ReorderTrackableFragment
        }
    }
}`;

async function reorderTrackable(
    sourceId: string,
    destinationId: string,
    mutate: MutationFunc<IReorderTrackableResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    log.trace("reorderTrackable(); sourceId=%o; destId=%o", sourceId,
        destinationId);
    const result = await mutate({
        optimisticResponse: getOptimisticResponse(
            sourceId, destinationId, apollo),
        update: (proxy, response) => {
            sortActiveTrackables(proxy);
        },
        variables: { sourceId, destinationId },
    });
    return result.data;
}

function getOptimisticResponse(
    sourceId: string,
    destinationId: string,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const activeTrackables =
        getActiveTrackables(apollo)!.getActiveTrackables.edges;
    const sourceTrackable = apollo.readFragment<ITrackableFragment>({
        fragment: trackableFragment,
        id: dataIdFromObject({ __typename: Type.Counter, id: sourceId })!,
    })!;

    for (let i = 0; i < activeTrackables.length; ++i) {
        const activeTrackable = activeTrackables[i].node;

        if (activeTrackable.id !== destinationId) {
            continue;
        }

        let nextTrackableOrder;
        const isMovingFromTop = sourceTrackable.order > activeTrackable.order;

        if (isMovingFromTop) {
            nextTrackableOrder = activeTrackables[i + 1] ?
                activeTrackables[i + 1].node.order : activeTrackable.order - 1;
        } else {
            nextTrackableOrder = activeTrackables[i - 1] ?
                activeTrackables[i - 1].node.order : activeTrackable.order + 1;
        }

        sourceTrackable.order =
            (activeTrackable.order + nextTrackableOrder) / 2;
        break;
    }

    return {
        __typename: Type.Mutation,
        reorderTrackable: {
            __typename: Type.ReorderTrackableResponse,
            trackable: sourceTrackable,
        },
    } as IReorderTrackableResponse;
}

export { reorderTrackable, reorderTrackableQuery, IReorderTrackableResponse };

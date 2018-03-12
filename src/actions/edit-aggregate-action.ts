import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo";
import dataIdFromObject from "utils/data-id-from-object";

interface IEditAggregateResponse {
    editAggregate: {
        trackable: {
            id: string;
            title: string;
        };
    };
}

interface IEditAggregateFragment {
    id: string;
    title?: string;
}

const aggregateFragment = gql`
fragment EditAggregateFragment on Aggregate {
    id
    title
}`;

const editAggregateQuery = gql`
${aggregateFragment}

mutation EditAggregate($aggregate: EditAggregateInput!) {
    editAggregate(aggregate: $aggregate) {
        trackable {
            ...EditAggregateFragment
        }
    }
}`;

async function editAggregate(
    aggregate: IEditAggregateFragment,
    mutate: MutationFunc<IEditAggregateResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    const result = await mutate({
        optimisticResponse: getOptimisticResponse(aggregate, apollo),
        variables: { aggregate },
    });
    return result.data as IEditAggregateResponse;
}

function getOptimisticResponse(
    aggregate: IEditAggregateFragment, apollo: DataProxy,
) {
    const fragmentId = dataIdFromObject(
        { __typename: Type.Aggregate, id: aggregate.id })!;
    const trackable = apollo.readFragment<IEditAggregateFragment>(
        { fragment: aggregateFragment, id: fragmentId })!;
    trackable.title = aggregate.title;
    return {
        __typename: Type.Mutation,
        editAggregate: {
            __typename: Type.EditAggregateResponse,
            trackable,
        },
    } as IEditAggregateResponse;
}

export {
    editAggregate,
    editAggregateQuery,
    IEditAggregateResponse,
    IEditAggregateFragment,
};

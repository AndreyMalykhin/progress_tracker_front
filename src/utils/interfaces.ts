import { ApolloQueryResult } from "apollo-client";
import { FetchMoreOptions } from "apollo-client/core/ObservableQuery";
import { FetchMoreQueryOptions } from "apollo-client/core/watchQueryOptions";
import Type from "models/type";

type IFetchMore = (options: FetchMoreQueryOptions & FetchMoreOptions) =>
    Promise< ApolloQueryResult<any> >;

interface IConnection<TNode, TCursor> {
    __typename?: Type;
    edges: Array<{
        cursor: TCursor;
        node: TNode;
    }>;
    pageInfo: {
        hasNextPage: boolean;
        endCursor?: TCursor;
    };
}

export { IFetchMore, IConnection };

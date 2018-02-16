import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient, ApolloQueryResult } from "apollo-client";
import { FetchMoreOptions } from "apollo-client/core/ObservableQuery";
import { FetchMoreQueryOptions } from "apollo-client/core/watchQueryOptions";

type IFetchMore = (options: FetchMoreQueryOptions & FetchMoreOptions) =>
    Promise< ApolloQueryResult<any> >;

interface IWithApolloProps {
    client: ApolloClient<NormalizedCacheObject>;
}

export { IFetchMore, IWithApolloProps };

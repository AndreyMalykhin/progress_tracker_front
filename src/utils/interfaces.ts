import { ApolloQueryResult } from "apollo-client";
import { FetchMoreOptions } from "apollo-client/core/ObservableQuery";
import { FetchMoreQueryOptions } from "apollo-client/core/watchQueryOptions";

type IFetchMore = (options: FetchMoreQueryOptions & FetchMoreOptions) =>
    Promise< ApolloQueryResult<any> >;

export { IFetchMore };

import { QueryProps } from "react-apollo/types";
import { IConnection } from "utils/interfaces";
import { isLoading } from "utils/query-status";

function loadMore(data: QueryProps, responseField: string) {
    const { fetchMore, networkStatus } = data;
    const response = (data as any)[responseField] as IConnection<any, any>;

    if (!response.pageInfo.hasNextPage || isLoading(networkStatus)) {
        return;
    }

    fetchMore({
        updateQuery: (previousResult, { fetchMoreResult }) => {
            const { edges, pageInfo } =
                fetchMoreResult![responseField] as IConnection<any, any>;

            if (!edges.length) {
                return {
                    ...previousResult,
                    [responseField]: {
                        ...previousResult[responseField],
                        pageInfo,
                    },
                };
            }

            const previousEdges =
                (previousResult[responseField] as IConnection<any, any>).edges;
            return {
                ...fetchMoreResult,
                [responseField]: {
                    ...fetchMoreResult![responseField],
                    edges: previousEdges.concat(edges),
                },
            };
        },
        variables: { cursor: response.pageInfo.endCursor },
    });
}

export default loadMore;

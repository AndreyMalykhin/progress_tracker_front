import { throttle } from "lodash";
import * as React from "react";
import { QueryProps } from "react-apollo/types";
import { IConnection } from "utils/connection";
import { isLoading } from "utils/query-status";

interface IWithLoadMoreProps {
    onLoadMore: () => void;
}

interface IResponse {
    [key: string]: any;
}

function withLoadMore<
    TProps extends IWithLoadMoreProps,
    TResponse extends IResponse
>(
    responseField: keyof TResponse,
    getData: (props: TProps) => QueryProps & TResponse,
) {
    return (Component: React.ComponentType<TProps>) => {
        return class WithLoadMore extends React.Component<TProps> {
            public constructor(props: TProps, context: any) {
                super(props, context);
                this.onLoadMore = throttle(this.onLoadMore, 1024);
            }

            public render() {
                return (
                    <Component onLoadMore={this.onLoadMore} {...this.props} />
                );
            }

            private onLoadMore = () => {
                const data = getData(this.props);
                const { fetchMore, networkStatus } = data;
                const response = (data as any)[responseField] as
                    IConnection<any, any>;

                if (!response.pageInfo.hasNextPage
                    || isLoading(networkStatus)
                ) {
                    return;
                }

                try {
                    fetchMore({
                        updateQuery: this.updateQuery,
                        variables: { cursor: response.pageInfo.endCursor },
                    });
                } catch (e) {
                    // already reported
                }
            }

            private updateQuery(previousResult: IResponse, options: any) {
                const fetchMoreResult: IResponse = options.fetchMoreResult;
                const { edges, pageInfo } =
                    fetchMoreResult![responseField] as IConnection<any, any>;

                if (!edges.length) {
                    return {
                        ...previousResult,
                        [responseField]: {
                            ...previousResult[responseField] as object,
                            pageInfo,
                        },
                    };
                }

                const previousEdges = (previousResult[responseField] as
                    IConnection<any, any>).edges;
                return {
                    ...fetchMoreResult,
                    [responseField]: {
                        ...fetchMoreResult![responseField] as object,
                        edges: previousEdges.concat(edges),
                    },
                };
            }
        };
    };
}

export { IWithLoadMoreProps };
export default withLoadMore;

import { IWithNetworkStatusProps } from "components/with-network-status";
import { throttle } from "lodash";
import * as React from "react";
import { QueryProps } from "react-apollo/types";
import { IConnection } from "utils/connection";
import { isLoading } from "utils/query-status";

interface IWithLoadMoreProps {
    onLoadMore: () => void;
}

interface IData {
    [field: string]: any;
}

interface IOptions<TProps, TData> {
    dataField: keyof TData;
    getQuery: (props: TProps) => QueryProps & TData;
}

function withLoadMore<
    TProps extends IWithLoadMoreProps & IWithNetworkStatusProps,
    TData extends IData
>(
    options: IOptions<TProps, TData>,
) {
    return (Component: React.ComponentType<TProps>) => {
        const { dataField, getQuery } = options;

        class WithLoadMore extends React.Component<TProps> {
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
                const query = getQuery(this.props);
                const { fetchMore, networkStatus } = query;
                const data = query[dataField];

                if (!data.pageInfo.hasNextPage
                    || isLoading(networkStatus)
                    || !this.props.isOnline
                ) {
                    return;
                }

                try {
                    fetchMore({
                        updateQuery: this.updateQuery as any,
                        variables: { cursor: data.pageInfo.endCursor },
                    });
                } catch (e) {
                    // already reported
                }
            }

            private updateQuery(previousResult: TData, updateOptions: any) {
                const fetchMoreResult: TData = updateOptions.fetchMoreResult;
                const { edges, pageInfo } =
                    fetchMoreResult![dataField] as IConnection<any, any>;

                if (!edges.length) {
                    return {
                        ...previousResult as object,
                        [dataField]: {
                            ...previousResult[dataField] as object,
                            pageInfo,
                        },
                    };
                }

                const previousEdges = previousResult[dataField].edges;
                return {
                    ...fetchMoreResult as object,
                    [dataField]: {
                        ...fetchMoreResult![dataField] as object,
                        edges: previousEdges.concat(edges),
                    },
                };
            }
        }

        return WithLoadMore;
    };
}

export { IWithLoadMoreProps };
export default withLoadMore;

import { IWithSessionProps } from "components/with-session";
import * as React from "react";
import { QueryProps } from "react-apollo";
import makeLog from "utils/make-log";
import QueryStatus from "utils/query-status";

interface IState {
    isVisible?: boolean;
}

interface IOptions<TProps, TData> {
    dataField: keyof TData;
    minDuration?: number;
    showIfNoQuery?: boolean;
    getQuery: (props: TProps) => (QueryProps & TData) | undefined;
}

const log = makeLog("with-loader");

const defaultOptions: Partial< IOptions<any, any> > = {
    minDuration: 0,
    showIfNoQuery: true,
};

function withLoader<TProps extends {}, TData extends {}>(
    loader: React.ComponentType, options: IOptions<TProps, TData>,
) {
    return (Component: React.ComponentType<TProps>) => {
        const { minDuration, getQuery, showIfNoQuery, dataField } = {
            ...defaultOptions, ...options,
        };

        class WithLoader extends React.Component<TProps, IState> {
            public state: IState = {};
            private timeoutId?: NodeJS.Timer;

            public render() {
                log.trace("render(); isVisible=%o", this.state.isVisible);
                return this.state.isVisible ? React.createElement(loader) :
                    <Component {...this.props} />;
            }

            public componentWillMount() {
                this.updateVisibility(getQuery(this.props));
            }

            public componentWillReceiveProps(nextProps: TProps) {
                const prevQuery = getQuery(this.props);
                const nextQuery = getQuery(nextProps);
                const prevNetworkStatus = prevQuery && prevQuery.networkStatus;
                const nextNetworkStatus = nextQuery && nextQuery.networkStatus;

                if (prevNetworkStatus === nextNetworkStatus
                    || prevNetworkStatus === QueryStatus.LoadingMore
                    || prevNetworkStatus === QueryStatus.Polling
                    || prevNetworkStatus === QueryStatus.Reloading
                ) {
                    return;
                }

                this.updateVisibility(nextQuery);
            }

            public componentWillUnmount() {
                clearTimeout(this.timeoutId!);
            }

            private updateVisibility(query?: QueryProps & TData) {
                let isVisible = false;
                const networkStatus = query && query.networkStatus;
                const data = query && query[dataField];

                if (networkStatus === QueryStatus.Ready || data) {
                    if (minDuration) {
                        isVisible = true;

                        if (this.timeoutId) {
                            clearTimeout(this.timeoutId);
                        }

                        this.timeoutId = setTimeout(() => {
                            const newQuery = getQuery(this.props);
                            const newNetworkStatus =
                                newQuery && newQuery.networkStatus;
                            const newData = newQuery && newQuery[dataField];

                            if (newNetworkStatus === QueryStatus.Ready
                                || newData
                            ) {
                                this.setState({ isVisible: false });
                            }
                        }, minDuration);
                    } else {
                        isVisible = false;
                    }
                } else if (networkStatus === QueryStatus.InitialLoading
                    || networkStatus === QueryStatus.SetVariables
                    || (!query && showIfNoQuery)
                ) {
                    isVisible = true;
                }

                this.setState({ isVisible });
            }
        }

        return WithLoader;
    };
}

export default withLoader;

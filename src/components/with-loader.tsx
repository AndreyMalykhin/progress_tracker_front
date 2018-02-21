import * as React from "react";
import { QueryProps } from "react-apollo";
import QueryStatus from "utils/query-status";

interface IOwnProps {
    [query: string]: QueryProps;
}

interface IState {
    isVisible?: boolean;
}

function withLoader<T>(
    loader: React.ComponentType<T>,
    minDuration = 512,
    queryKey = "data",
) {
    return <P extends {}>(Component: React.ComponentType<P>) => {
        class WithLoader extends React.Component<P & IOwnProps, IState> {
            public state: IState = {};
            private timeoutId?: NodeJS.Timer;

            public render() {
                return this.state.isVisible ? React.createElement(loader) :
                    <Component {...this.props} />;
            }

            public componentWillMount() {
                this.updateVisibility(this.props[queryKey]);
            }

            public componentWillReceiveProps(nextProps: P & IOwnProps) {
                const prevQuery: QueryProps = this.props[queryKey];
                const nextQuery: QueryProps = nextProps[queryKey];
                const prevNetworkStatus = prevQuery && prevQuery.networkStatus;
                const nextNetworkStatus = nextQuery && nextQuery.networkStatus;

                if (prevNetworkStatus === nextNetworkStatus
                    || prevNetworkStatus === QueryStatus.LoadingMore
                    || prevNetworkStatus === QueryStatus.Polling
                    || prevNetworkStatus === QueryStatus.Reloading
                ) {
                    return;
                }

                this.updateVisibility(nextProps[queryKey]);
            }

            public componentWillUnmount() {
                clearTimeout(this.timeoutId!);
            }

            private updateVisibility(query?: QueryProps) {
                let isVisible = false;
                const networkStatus = query && query.networkStatus;

                if (!networkStatus || networkStatus === QueryStatus.Ready) {
                    if (minDuration) {
                        isVisible = true;

                        if (this.timeoutId) {
                            clearTimeout(this.timeoutId);
                        }

                        this.timeoutId = setTimeout(() => {
                            const newQuery: QueryProps = this.props[queryKey];
                            const newNetworkStatus =
                                newQuery && newQuery.networkStatus;

                            if (newNetworkStatus === networkStatus) {
                                this.setState({ isVisible: false });
                            }
                        }, minDuration);
                    } else {
                        isVisible = false;
                    }
                } else if (networkStatus === QueryStatus.InitialLoading
                    || networkStatus === QueryStatus.SetVariables
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

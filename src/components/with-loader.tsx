import { IWithSessionProps } from "components/with-session";
import * as React from "react";
import { QueryProps } from "react-apollo";
import QueryStatus from "utils/query-status";

interface IOwnProps {
    [prop: string]: QueryProps;
}

interface IState {
    isVisible?: boolean;
}

interface IOptions {
    minDuration: number;
    queryProp: string;
    showIfNoQuery: boolean;
}

const defaultOptions: IOptions = {
    minDuration: 0,
    queryProp: "data",
    showIfNoQuery: true,
};

function withLoader<P extends {}, T>(
    loader: React.ComponentType<T>, options?: Partial<IOptions>,
) {
    return (Component: React.ComponentType<P>) => {
        const { minDuration, queryProp, showIfNoQuery } = {
            ...defaultOptions, ...options,
        };

        class WithLoader extends React.Component<P & IOwnProps, IState> {
            public state: IState = {};
            private timeoutId?: NodeJS.Timer;

            public render() {
                return this.state.isVisible ? React.createElement(loader) :
                    <Component {...this.props} />;
            }

            public componentWillMount() {
                this.updateVisibility(this.props[queryProp]);
            }

            public componentWillReceiveProps(nextProps: P & IOwnProps) {
                const prevQuery: QueryProps = this.props[queryProp];
                const nextQuery: QueryProps = nextProps[queryProp];
                const prevNetworkStatus = prevQuery && prevQuery.networkStatus;
                const nextNetworkStatus = nextQuery && nextQuery.networkStatus;

                if (prevNetworkStatus === nextNetworkStatus
                    || prevNetworkStatus === QueryStatus.LoadingMore
                    || prevNetworkStatus === QueryStatus.Polling
                    || prevNetworkStatus === QueryStatus.Reloading
                ) {
                    return;
                }

                this.updateVisibility(nextProps[queryProp]);
            }

            public componentWillUnmount() {
                clearTimeout(this.timeoutId!);
            }

            private updateVisibility(query?: QueryProps) {
                let isVisible = false;
                const networkStatus = query && query.networkStatus;

                if (networkStatus === QueryStatus.Ready) {
                    if (minDuration) {
                        isVisible = true;

                        if (this.timeoutId) {
                            clearTimeout(this.timeoutId);
                        }

                        this.timeoutId = setTimeout(() => {
                            const newQuery: QueryProps = this.props[queryProp];
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

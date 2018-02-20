import * as React from "react";
import QueryStatus from "utils/query-status";

interface IProps {
    queryStatus?: QueryStatus;
}

interface IState {
    isVisible?: boolean;
}

function withLoader<T>(loader: React.ComponentType<T>, minDuration?: number) {
    return <P extends {}>(Component: React.ComponentType<P>) => {
        return class WithLoader extends React.Component<P & IProps, IState> {
            public state: IState = {};
            private timeoutId?: NodeJS.Timer;

            public render() {
                return this.state.isVisible ? React.createElement(loader) :
                    <Component {...this.props} />;
            }

            public componentWillMount() {
                this.updateVisibility(this.props.queryStatus);
            }

            public componentWillReceiveProps(nextProps: Readonly<P & IProps>) {
                const { queryStatus } = this.props;

                if (queryStatus === nextProps.queryStatus
                    || queryStatus === QueryStatus.LoadingMore
                    || queryStatus === QueryStatus.Polling
                    || queryStatus === QueryStatus.Reloading
                ) {
                    return;
                }

                this.updateVisibility(nextProps.queryStatus);
            }

            public componentWillUnmount() {
                clearTimeout(this.timeoutId!);
            }

            private updateVisibility(queryStatus?: QueryStatus) {
                let isVisible = false;

                if (queryStatus === QueryStatus.Ready || !queryStatus) {
                    if (minDuration) {
                        isVisible = true;

                        if (this.timeoutId) {
                            clearTimeout(this.timeoutId);
                        }

                        this.timeoutId = setTimeout(() => {
                            if (this.props.queryStatus === queryStatus) {
                                this.setState({ isVisible: false });
                            }
                        }, minDuration);
                    } else {
                        isVisible = false;
                    }
                } else if (queryStatus === QueryStatus.InitialLoading
                    || queryStatus === QueryStatus.SetVariables
                ) {
                    isVisible = true;
                }

                this.setState({ isVisible });
            }
        };
    };
}

export default withLoader;

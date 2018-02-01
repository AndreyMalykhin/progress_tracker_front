import * as React from "react";
import QueryStatus from "utils/query-status";

interface IProps {
    queryStatus: QueryStatus;
}

interface IState {
    isVisible: boolean;
}

function withLoader<T>(loader: React.ComponentClass<T>, minDuration?: number) {
    return <P extends {}>(Component: React.ComponentClass<P>) => {
        return class EnchancedComponent extends React.Component<P & IProps, IState> {
            public state: IState;

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
                    || queryStatus === QueryStatus.SetVariables
                ) {
                    return;
                }

                this.updateVisibility(nextProps.queryStatus);
            }

            private updateVisibility(queryStatus: QueryStatus) {
                let isVisible = false;

                if (queryStatus === QueryStatus.Ready) {
                    if (minDuration) {
                        isVisible = true;
                        setTimeout(() => {
                            this.setState({ isVisible: false });
                        }, minDuration);
                    } else {
                        isVisible = false;
                    }
                } else if (queryStatus === QueryStatus.InitialLoading) {
                    isVisible = true;
                }

                this.setState({ isVisible });
            }
        };
    };
}

export default withLoader;

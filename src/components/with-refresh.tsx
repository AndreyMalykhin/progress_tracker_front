import * as React from "react";
import { QueryProps } from "react-apollo";

interface IWithRefreshProps {
    isRefreshing: boolean;
    onRefresh?: () => void;
}

interface IState {
    isRefreshing: boolean;
}

interface IOwnProps {
    data: QueryProps;
}

function withRefresh<P extends IOwnProps>(condition?: (props: P) => boolean) {
    return (Component: React.ComponentType<P & IWithRefreshProps>) => {
        class WithRefresh extends React.Component<P> {
            public state: IState = { isRefreshing: false };

            public render() {
                const onRefresh = !condition || condition(this.props) ?
                    this.onRefresh : undefined;
                return (
                    <Component
                        isRefreshing={this.state.isRefreshing}
                        onRefresh={onRefresh}
                        {...this.props}
                    />
                );
            }

            private onRefresh = async () => {
                this.setState({ isRefreshing: true });

                try {
                    await this.props.data.refetch();
                } catch (e) {
                    // already reported
                } finally {
                    this.setState({ isRefreshing: false });
                }
            }
        }

        return WithRefresh;
    };
}

export { IWithRefreshProps };
export default withRefresh;

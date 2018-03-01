import { isAnonymous } from "actions/session-helpers";
import { IWithNetworkStatusProps } from "components/with-network-status";
import { IWithSessionProps } from "components/with-session";
import { IWithSyncStatusProps } from "components/with-sync-status";
import * as React from "react";
import { QueryProps } from "react-apollo";

interface IWithRefreshProps {
    isRefreshing: boolean;
    onRefresh?: () => void;
}

interface IState {
    isRefreshing: boolean;
}

interface IOwnProps extends
    IWithSyncStatusProps, IWithNetworkStatusProps, IWithSessionProps {}

interface IOptions<P> {
    isMyData: (props: P) => boolean;
    isReadonlyData: (props: P) => boolean;
    getQuery: (props: P) => QueryProps;
}

function withRefresh<P extends IOwnProps>(options: IOptions<P>) {
    return (Component: React.ComponentType<P & IWithRefreshProps>) => {
        const { isMyData, getQuery, isReadonlyData } = options;

        class WithRefresh extends React.Component<P> {
            public state: IState = { isRefreshing: false };

            public render() {
                const { session, isSyncing, isOnline } = this.props;
                const canRefresh = isOnline
                    && (!isSyncing || isReadonlyData(this.props))
                    && (!isAnonymous(session) || !isMyData(this.props));
                const onRefresh = canRefresh ? this.onRefresh : undefined;
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
                const query = getQuery(this.props);

                try {
                    await query.refetch();
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

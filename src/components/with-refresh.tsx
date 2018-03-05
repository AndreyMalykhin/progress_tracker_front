import { isAnonymous } from "actions/session-helpers";
import { IWithNetworkStatusProps } from "components/with-network-status";
import { IWithSessionProps } from "components/with-session";
import { IWithSyncStatusProps } from "components/with-sync-status";
import * as React from "react";
import { QueryProps } from "react-apollo";
import QueryStatus from "utils/query-status";

interface IWithRefreshProps {
    isRefreshing: boolean;
    onRefresh?: () => void;
}

interface IState {
    isRefreshingManually: boolean;
}

interface IOwnProps extends
    IWithSyncStatusProps, IWithNetworkStatusProps, IWithSessionProps {}

interface IOptions<TProps, TData> {
    dataField: keyof TData;
    isMyData: (props: TProps) => boolean;
    isReadonlyData: (props: TProps) => boolean;
    getQuery: (props: TProps) => QueryProps & TData;
}

function withRefresh<TProps extends IOwnProps, TData extends {}>(
    options: IOptions<TProps, TData>,
) {
    return (Component: React.ComponentType<TProps & IWithRefreshProps>) => {
        const { isMyData, getQuery, isReadonlyData, dataField } = options;

        class WithRefresh extends React.Component<TProps> {
            public state: IState = { isRefreshingManually: false };

            public render() {
                const { session, isSyncing, isOnline } = this.props;
                const canRefresh = isOnline
                    && (!isSyncing || isReadonlyData(this.props))
                    && (!isAnonymous(session) || !isMyData(this.props));
                const onRefresh = canRefresh ? this.onRefresh : undefined;
                const isRefreshing = this.state.isRefreshingManually
                    || this.isRefreshingAutomatically();
                return (
                    <Component
                        isRefreshing={isRefreshing}
                        onRefresh={onRefresh}
                        {...this.props}
                    />
                );
            }

            private isRefreshingAutomatically() {
                const query = getQuery(this.props);
                return query[dataField]
                    && query.networkStatus === QueryStatus.InitialLoading;
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

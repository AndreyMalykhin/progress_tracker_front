import { isAnonymous } from "actions/session-helpers";
import { FetchPolicy } from "apollo-client/core/watchQueryOptions";
import { IWithDIContainerProps } from "components/with-di-container";
import { IWithNetworkStatusProps } from "components/with-network-status";
import { IWithSessionProps } from "components/with-session";
import { IWithSyncStatusProps } from "components/with-sync-status";
import * as React from "react";
import defaultId from "utils/default-id";
import makeLog from "utils/make-log";
import uuid from "utils/uuid";

interface IWithFetchPolicyProps {
    fetchPolicy: FetchPolicy;
}

interface IOwnProps extends
    IWithSyncStatusProps,
    IWithSessionProps,
    IWithNetworkStatusProps,
    IWithDIContainerProps {}

interface IOptions<P> {
    isMyData: (props: P) => boolean;
    isReadonlyData: (props: P) => boolean;
    getNamespace?: (props: P) => string|undefined;
    cacheLifetime?: number;
}

const log = makeLog("with-fetch-policy");

function withFetchPolicy<P extends IOwnProps>(options: IOptions<P>) {
    return (
        Component: React.ComponentType<P & IWithFetchPolicyProps>,
    ) => {
        const { cacheLifetime, getNamespace, isMyData, isReadonlyData } =
            options;
        const lastRefreshDate: { [namespace: string]: number } = {};

        class WithFetchPolicy extends React.Component<P> {
            private namespace: string = "";
            private fetchPolicy: FetchPolicy = "cache-first";

            public render() {
                return (
                    <Component
                        fetchPolicy={this.fetchPolicy}
                        {...this.props}
                    />
                );
            }

            public componentWillMount() {
                log.trace("componentWillMount()");
                this.init(this.props);
            }

            public componentWillReceiveProps(nextProps: P) {
                if (this.props.session.userId !== nextProps.session.userId
                    || this.props.isSyncing !== nextProps.isSyncing
                    || this.props.isOnline !== nextProps.isOnline
                    || (getNamespace
                        && getNamespace(this.props) !== getNamespace(nextProps))
                ) {
                    this.init(nextProps);
                }
            }

            public componentWillUnmount() {
                log.trace("componentWillUnmount()");
            }

            private initFetchPolicy(props: P) {
                if (!props.isOnline
                    || (isAnonymous(props.session) && isMyData(props))
                ) {
                    this.fetchPolicy = "cache-only";
                    return;
                }

                if (!this.isExpired()
                    || (props.isSyncing && !isReadonlyData(props))
                ) {
                    this.fetchPolicy = "cache-first";
                    return;
                }

                this.fetchPolicy = "cache-and-network";
            }

            private initNamespace(props: P) {
                this.namespace = props.session.accessToken +
                    (getNamespace ? "_" + getNamespace(props) : "");
            }

            private init(props: P) {
                this.initNamespace(props);
                this.initFetchPolicy(props);

                if (this.fetchPolicy === "cache-and-network") {
                    lastRefreshDate[this.namespace] = Date.now();
                }

                log.trace("init(); fetchPolicy=%o; namespace=%o",
                    this.fetchPolicy, this.namespace);
            }

            private isExpired() {
                const newCacheLifetime = cacheLifetime
                    || this.props.diContainer.envConfig.cacheRefreshPeriod;
                const date = lastRefreshDate[this.namespace];
                return !date || (date + newCacheLifetime) <= Date.now();
            }
        }

        return WithFetchPolicy;
    };
}

export { IWithFetchPolicyProps };
export default withFetchPolicy;

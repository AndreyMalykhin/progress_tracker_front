import { FetchPolicy } from "apollo-client/core/watchQueryOptions";
import gql from "graphql-tag";
import Type from "models/type";
import * as React from "react";
import { withApollo } from "react-apollo";
import dataIdFromObject from "utils/data-id-from-object";
import { IWithApolloProps } from "utils/interfaces";
import makeLog from "utils/make-log";

interface IWithCacheLifetimeProps {
    fetchPolicy: FetchPolicy;
    onFetchSuccess: () => void;
}

interface IQueryFragment {
    id: string;
    lastRefetchDate?: number;
}

const log = makeLog("with-cache-lifetime");

const queryFragment = gql`
fragment WithCacheLifetimeRequestFragment on Request {
    id
    lastRefetchDate
}`;

function withCacheLifetime<P>(queryId: string, lifetime: number = 32000) {
    return (Component: React.ComponentType<P & IWithCacheLifetimeProps>) => {
        class WithCacheLifetime extends React.Component<P & IWithApolloProps> {
            private lastRefetchDate?: Date;
            private isExpired = false;
            private fragmentId =
                dataIdFromObject({ __typename: Type.Request, id: queryId })!;

            public render() {
                const fetchPolicy: FetchPolicy =
                    this.isExpired ? "cache-and-network" : "cache-first";
                return (
                    <Component
                        fetchPolicy={fetchPolicy}
                        onFetchSuccess={this.onFetchSuccess}
                        {...this.props}
                    />
                );
            }

            public componentWillMount() {
                this.init();
            }

            private init() {
                this.lastRefetchDate = this.loadLastRefetchDate();
                this.isExpired = !this.lastRefetchDate
                    || Date.now() > this.lastRefetchDate.getTime() + lifetime;
                log("init(); isExpired=%o lastRefetchDate=%o",
                    this.isExpired, this.lastRefetchDate);
            }

            private onFetchSuccess = () => {
                if (!this.isExpired) {
                    return;
                }

                this.isExpired = false;
                this.lastRefetchDate = new Date();
                this.saveLastRefetchDate();
            }

            private loadLastRefetchDate() {
                const query = this.props.client.readFragment<IQueryFragment>(
                    { id: this.fragmentId, fragment: queryFragment });
                return query ? new Date(query.lastRefetchDate || Date.now()) :
                    undefined;
            }

            private saveLastRefetchDate() {
                log("saveLastRefetchDate(); date=%o", this.lastRefetchDate);
                this.props.client.writeFragment({
                    data: {
                        __typename: Type.Request,
                        id: queryId,
                        lastRefetchDate: this.lastRefetchDate!.getTime(),
                    },
                    fragment: queryFragment,
                    id: this.fragmentId,
                });
            }
        }

        return withApollo(WithCacheLifetime);
    };
}

export { IWithCacheLifetimeProps };
export default withCacheLifetime;

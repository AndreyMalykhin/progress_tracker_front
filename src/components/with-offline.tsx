import { IWithNetworkStatusProps } from "components/with-network-status";
import * as React from "react";
import { QueryProps } from "react-apollo";

type IOwnProps = IWithNetworkStatusProps;

function withOffline<TProps extends IOwnProps, TData extends {}>(
    Offline: React.ComponentType,
    dataField: keyof TData,
    getQuery: (props: TProps) => QueryProps & TData,
) {
    return (Component: React.ComponentType<TProps>) => {
        class WithOffline extends React.Component<TProps> {
            public render() {
                const query = getQuery(this.props);
                return this.props.isOnline || (query && query[dataField]) ?
                    <Component {...this.props} /> : <Offline />;
            }
        }

        return WithOffline;
    };
}

export default withOffline;

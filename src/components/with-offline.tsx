import { IWithNetworkStatusProps } from "components/with-network-status";
import * as React from "react";
import { QueryProps } from "react-apollo";

type IOwnProps = IWithNetworkStatusProps;

interface IOptions<TProps, TData> {
    dataField: keyof TData;
    getQuery: (props: TProps) => QueryProps & TData;
}

function withOffline<TProps extends IOwnProps, TData extends {}>(
    Offline: React.ComponentType, options: IOptions<TProps, TData>,
) {
    return (Component: React.ComponentType<TProps>) => {
        const { dataField, getQuery } = options;

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

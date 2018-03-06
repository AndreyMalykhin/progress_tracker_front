import Error from "components/error";
import * as React from "react";
import { QueryProps } from "react-apollo";
import QueryStatus from "utils/query-status";

interface IOptions<TProps, TData> {
    dataField: keyof TData;
    getQuery: (props: TProps) => (QueryProps & TData) | undefined;
}

function withError<TProps extends {}, TData extends {}>(
    error: React.ComponentType, options: IOptions<TProps, TData>,
) {
    return (Component: React.ComponentType<TProps>) => {
        const { dataField, getQuery } = options;

        class WithError extends React.Component<TProps> {
            public render() {
                const query = getQuery(this.props);

                if (query
                    && (query.error
                        || query.networkStatus === QueryStatus.Error)
                    && !query[dataField]
                ) {
                    return React.createElement(error);
                }

                return <Component {...this.props} />;
            }
        }

        return WithError;
    };
}

export default withError;

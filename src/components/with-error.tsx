import Error from "components/error";
import * as React from "react";
import { QueryProps } from "react-apollo";
import QueryStatus from "utils/query-status";

function withError<TProps extends {}>(
    error: React.ComponentType,
    getQuery: (props: TProps) => QueryProps | undefined,
) {
    return (Component: React.ComponentType<TProps>) => {
        return class WithError extends React.Component<TProps> {
            public render() {
                const query = getQuery(this.props);

                if (query && (query.networkStatus === QueryStatus.Error
                    || query.error)
                ) {
                    return React.createElement(error);
                }

                return <Component {...this.props} />;
            }
        };
    };
}

export default withError;

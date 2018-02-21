import Error from "components/error";
import * as React from "react";
import { QueryProps } from "react-apollo";
import QueryStatus from "utils/query-status";

interface IOwnProps {
    [query: string]: QueryProps;
}

function withError<T>(error: React.ComponentType<T>, queryKey = "data") {
    return <P extends {}>(Component: React.ComponentType<P>) => {
        return class WithError extends React.Component<P & IOwnProps> {
            public render() {
                const query: QueryProps = this.props[queryKey];

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

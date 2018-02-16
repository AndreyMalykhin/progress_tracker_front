import * as React from "react";
import QueryStatus from "utils/query-status";

interface IOwnProps {
    queryStatus: QueryStatus;
}

function withError<T>(error: React.ComponentClass<T>) {
    return <P extends {}>(Component: React.ComponentClass<P>) => {
        return class WithError extends React.Component<P & IOwnProps> {
            public render() {
                return this.props.queryStatus === QueryStatus.Error ?
                    React.createElement(error) : <Component {...this.props} />;
            }
        };
    };
}

export default withError;

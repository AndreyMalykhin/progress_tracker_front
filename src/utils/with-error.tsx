import * as React from "react";
import QueryStatus from "utils/query-status";

interface IProps {
    queryStatus: QueryStatus;
}

function withError<T>(error: React.ComponentClass<T>) {
    return <P extends {}>(Component: React.ComponentClass<P>) => {
        return class EnchancedComponent extends React.Component<P & IProps> {
            public render() {
                return this.props.queryStatus === QueryStatus.Error ?
                    React.createElement(error) : <Component {...this.props} />;
            }
        };
    };
}

export default withError;

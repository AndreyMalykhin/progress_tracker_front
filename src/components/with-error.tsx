import Error from "components/error";
import * as React from "react";
import { QueryProps } from "react-apollo";
import QueryStatus from "utils/query-status";

interface IOwnProps {
    [query: string]: QueryProps;
}

interface IOptions {
    queryProp: string;
}

const defaultOptions: IOptions = {
    queryProp: "data",
};

function withError<P extends {}, T>(
    error: React.ComponentType<T>, options?: Partial<IOptions>,
) {
    return (Component: React.ComponentType<P>) => {
        const { queryProp } = { ...defaultOptions, ...options };

        return class WithError extends React.Component<P & IOwnProps> {
            public render() {
                const query: QueryProps = this.props[queryProp];

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

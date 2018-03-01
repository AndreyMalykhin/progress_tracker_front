import gql from "graphql-tag";
import * as React from "react";
import { QueryProps } from "react-apollo";
import graphql from "react-apollo/graphql";

interface IWithNetworkStatusProps {
    isOnline?: boolean;
}

interface IGetDataResponse {
    offline: {
        isOnline?: boolean;
    };
}

const withDataQuery = gql`
query GetData {
    offline @client {
        isOnline
    }
}`;

function withNetworkStatus<P>(
    Component: React.ComponentType<P & IWithNetworkStatusProps>,
) {
    const withData = graphql<IGetDataResponse, {}, P & IWithNetworkStatusProps>(
        withDataQuery,
        {
            options: { fetchPolicy: "cache-only" },
            props: ({ data }) => {
                return { isOnline: data!.offline.isOnline };
            },
        },
    );

    class WithNetworkStatus extends
        React.Component<P & IWithNetworkStatusProps> {
        public render() {
            return (
                <Component
                    isOnline={this.props.isOnline}
                    {...this.props}
                />
            );
        }
    }

    return withData(WithNetworkStatus);
}

export { IWithNetworkStatusProps };
export default withNetworkStatus;

import gql from "graphql-tag";
import * as React from "react";
import { QueryProps } from "react-apollo";
import graphql from "react-apollo/graphql";

interface IWithSyncStatusProps {
    isSyncing?: boolean;
}

interface IGetDataResponse {
    offline: {
        hasOperations: boolean;
    };
}

const withDataQuery = gql`
query GetData {
    offline @client {
        hasOperations
    }
}`;

function withSyncStatus<P>(
    Component: React.ComponentType<P & IWithSyncStatusProps>,
) {
    const withData = graphql<IGetDataResponse, {}, P & IWithSyncStatusProps>(
        withDataQuery,
        {
            options: { fetchPolicy: "cache-only" },
            props: ({ data }) => {
                return { isSyncing: data!.offline.hasOperations };
            },
        },
    );

    class WithSyncStatus extends React.Component<P & IWithSyncStatusProps> {
        public render() {
            return (
                <Component
                    isSyncing={this.props.isSyncing}
                    {...this.props}
                />
            );
        }
    }

    return withData(WithSyncStatus);
}

export { IWithSyncStatusProps };
export default withSyncStatus;

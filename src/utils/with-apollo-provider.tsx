import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import * as React from "react";
import { ApolloProvider } from "react-apollo";

export default (apollo: ApolloClient<NormalizedCacheObject>) => {
    return <P extends {}>(Component: React.ComponentClass<P>) => {
        return (props: P) => {
            return (
                <ApolloProvider client={apollo}>
                    <Component {...props} />
                </ApolloProvider>
            );
        };
    };
};

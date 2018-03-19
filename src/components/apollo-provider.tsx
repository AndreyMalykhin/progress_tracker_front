import { ApolloClient } from "apollo-client";
import * as PropTypes from "prop-types";
import * as React from "react";

interface IApolloProviderProps<TCache> {
    client: ApolloClient<TCache>;
}

// Unlike official implementation, this one dosen't provide buggy Query Recycler
class ApolloProvider<TCache> extends
    React.Component<IApolloProviderProps<TCache>> {
    public static childContextTypes = {
        client: PropTypes.object.isRequired,
    };

    public render() {
        return this.props.children;
    }

    public getChildContext() {
        return {
            client: this.props.client,
        };
    }
}

export default ApolloProvider;

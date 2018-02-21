import gql from "graphql-tag";
import * as React from "react";
import graphql from "react-apollo/graphql";

interface IGetDataResponse {
    session: {
        id: string;
        accessToken?: string;
        userId?: string;
    };
}

interface IWithSessionProps {
    session: {
        accessToken?: string;
        userId?: string;
    };
}

const getDataQuery = gql`
query GetData {
    session @client {
        id
        accessToken
        userId
    }
}`;

function withSession<P>(
    component: React.ComponentType<P & IWithSessionProps>,
) {
    const WithSession = graphql<IGetDataResponse, P, P & IWithSessionProps>(
        getDataQuery,
        {
            options: { fetchPolicy: "cache-only" },
            props: ({ data }) => {
                return { session: data!.session };
            },
        },
    );

    return WithSession(component);
}

export { IWithSessionProps };
export default withSession;

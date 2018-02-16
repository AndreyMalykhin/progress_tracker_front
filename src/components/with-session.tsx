import gql from "graphql-tag";
import * as React from "react";
import graphql from "react-apollo/graphql";

interface IGetDataResponse {
    session: {
        id: string;
        accessToken: string;
        userId: string;
    };
}

interface IWithSessionProps {
    session: {
        accessToken?: string;
        userId: string;
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

function withSession<P extends IWithSessionProps>(
    component: React.ComponentClass<P>,
) {
    return graphql<IGetDataResponse, P, P>(
        getDataQuery,
        {
            props: ({ data }) => {
                return { session: data!.session };
            },
        },
    )(component);
}

export { IWithSessionProps };
export default withSession;

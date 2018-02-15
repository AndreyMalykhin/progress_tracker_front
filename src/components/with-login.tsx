import LoginContainer from "components/login-container";
import gql from "graphql-tag";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import myId from "utils/my-id";
import QueryStatus from "utils/query-status";

interface IWithLoginProps {
    accessToken?: string;
}

interface IGetDataResponse {
    getUserById: {
        id: string;
        accessToken?: string;
    };
}

const getDataQuery = gql`
query GetData($userId: ID!) {
    getUserById(id: $userId) {
        id
        accessToken
    }
}`;

const withData = graphql<IGetDataResponse, {}, IWithLoginProps>(
    getDataQuery,
    {
        options: {
            fetchPolicy: "cache-only",
            variables: { userId: myId },
        },
        props: ({ data }) => {
            const { networkStatus: queryStatus, getUserById } = data!;

            if (queryStatus === QueryStatus.InitialLoading
                || queryStatus === QueryStatus.Error
            ) {
                return {};
            }

            return { accessToken: getUserById.accessToken } as
                Partial<IWithLoginProps>;
        },
    },
);

function withLogin<T extends IWithLoginProps>(
    msgId: string, condition?: (props: T) => boolean,
) {
    return (Component: React.ComponentClass<T>) => {
        class WithLogin extends React.Component<T> {
            public render() {
                const isShown = (!condition || condition(this.props))
                    && this.props.accessToken == null;
                return isShown ? <LoginContainer msgId={msgId} /> :
                    <Component {...this.props} />;
            }
        }

        return compose(withData)(WithLogin);
    };
}

export { IWithLoginProps };
export default withLogin;

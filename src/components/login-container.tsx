import { ILoginResponse, login, loginQuery } from "actions/login-action";
import Login, { ILoginProps } from "components/login";
import graphql from "react-apollo/graphql";

interface IOwnProps {
    msgId?: string;
}

const withLogin = graphql<ILoginResponse, IOwnProps, ILoginProps>(
    loginQuery,
    {
        props: ({ mutate }) => {
            return {
                onLogin: () => login(mutate!),
            };
        },
    },
);

export default withLogin(Login);

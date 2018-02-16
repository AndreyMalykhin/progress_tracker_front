import { ILoginResponse, login, loginQuery } from "actions/login-action";
import graphql from "react-apollo/graphql";

interface IWithLoginActionProps {
    onLogin: () => void;
}

function withLoginAction<P>(
    component: React.ComponentType<P & IWithLoginActionProps>,
) {
    return graphql<ILoginResponse, P, P & IWithLoginActionProps>(
        loginQuery,
        {
            props: ({ mutate }) => {
                return {
                    onLogin: () => login(mutate!),
                };
            },
        },
    )(component);
}

export { IWithLoginActionProps };
export default withLoginAction;

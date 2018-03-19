import { ILoginResponse, login, loginQuery } from "actions/login-action";
import { addGenericErrorToast } from "actions/toast-helpers";
import { isApolloError } from "apollo-client/errors/ApolloError";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import { compose, withApollo } from "react-apollo";
import graphql from "react-apollo/graphql";
import { IWithApolloProps } from "utils/interfaces";

interface IWithLoginActionProps {
    onLogin: () => Promise<boolean>;
}

function withLoginAction<P>(
    component: React.ComponentType<P & IWithLoginActionProps>,
) {
    const WithLoginAction = graphql<
        ILoginResponse,
        P & IWithLoginActionProps & IWithDIContainerProps & IWithApolloProps,
        P & IWithLoginActionProps
    >(
        loginQuery,
        {
            props: ({ ownProps }) => {
                const { client, diContainer } = ownProps;
                return {
                    onLogin: async () => {
                        try {
                            return await login(client);
                        } catch (e) {
                            if (!isApolloError(e)) {
                                addGenericErrorToast(client);
                            }

                            return false;
                        }
                    },
                };
            },
        },
    );

    return WithLoginAction(component);
}

export { IWithLoginActionProps };
export default withLoginAction;

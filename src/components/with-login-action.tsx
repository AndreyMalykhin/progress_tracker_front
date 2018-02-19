import { ILoginResponse, login, loginQuery } from "actions/login-action";
import { addGenericErrorToast } from "actions/toast-helpers";
import { isApolloError } from "apollo-client/errors/ApolloError";
import { withApollo } from "react-apollo";
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
        P & IWithApolloProps,
        P & IWithLoginActionProps
    >(
        loginQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onLogin: async () => {
                        try {
                            return await login(mutate!);
                        } catch (e) {
                            if (!isApolloError(e)) {
                                addGenericErrorToast(ownProps.client);
                            }

                            return false;
                        }
                    },
                };
            },
        },
    );

    return withApollo(WithLoginAction(component));
}

export { IWithLoginActionProps };
export default withLoginAction;

import { ILoginResponse, login, loginQuery } from "actions/login-action";
import { addGenericErrorToast } from "actions/toast-helpers";
import { isApolloError } from "apollo-client/errors/ApolloError";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import { compose, withApollo } from "react-apollo";
import graphql from "react-apollo/graphql";
import Analytics from "utils/analytics";
import AnalyticsContext from "utils/analytics-context";
import AnalyticsEvent from "utils/analytics-event";
import { IWithApolloProps } from "utils/interfaces";
import makeLog from "utils/make-log";

interface IWithLoginActionProps {
    onLogin: (analyticsContext: AnalyticsContext) => Promise<boolean>;
}

const log = makeLog("with-login-action");

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
                    onLogin: async (analyticsContext: string) => {
                        Analytics.log(AnalyticsEvent.LoginBtnClick,
                            { context: analyticsContext });
                        let isCancelled;

                        try {
                            isCancelled = !await login(client);
                        } catch (e) {
                            if (!isApolloError(e)) {
                                addGenericErrorToast(client);
                            }

                            return false;
                        }

                        const event = isCancelled ?
                            AnalyticsEvent.FacebookLoginPageCancel :
                            AnalyticsEvent.FacebookLoginPageSubmit;
                        Analytics.log(event);
                    },
                };
            },
        },
    );

    return WithLoginAction(component);
}

export { IWithLoginActionProps };
export default withLoginAction;

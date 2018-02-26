import { IWithLoginActionProps } from "components/with-login-action";
import { IWithSessionProps } from "components/with-session";
import * as React from "react";
import { InjectedIntlProps } from "react-intl";
import { Alert } from "react-native";

interface IWithEnsureUserLoggedInProps {
    onEnsureUserLoggedIn: () => void;
}

interface IOwnProps extends
    IWithSessionProps, InjectedIntlProps, IWithLoginActionProps {}

function withEnsureUserLoggedIn<P>(
    Component: React.ComponentType<P & IWithEnsureUserLoggedInProps>,
) {
    class WithEnsureUserLoggedIn extends React.Component<P & IOwnProps> {
        public render() {
            return (
                <Component
                    onEnsureUserLoggedIn={this.onEnsureUserLoggedIn}
                    {...this.props}
                />
            );
        }

        private onEnsureUserLoggedIn = () => {
            const { session, intl, onLogin } = this.props;

            if (session.accessToken) {
                return true;
            }

            const msg = undefined;
            const { formatMessage } = intl;
            const title = formatMessage({ id: "common.loginToDo" });
            Alert.alert(title, msg, [
                {
                    style: "cancel",
                    text: formatMessage({ id: "common.cancel" }),
                },
                {
                    onPress: onLogin,
                    text: formatMessage({ id: "common.login" }),
                },
            ]);
            return false;
        }
    }

    return WithEnsureUserLoggedIn;
}

export { IWithEnsureUserLoggedInProps };
export default withEnsureUserLoggedIn;

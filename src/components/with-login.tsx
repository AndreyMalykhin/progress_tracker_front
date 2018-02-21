import LoginContainer from "components/login-container";
import withSession, { IWithSessionProps } from "components/with-session";
import * as React from "react";

function withLogin<P extends IWithSessionProps>(
    msgId: string, condition?: (props: P) => boolean,
) {
    return (Component: React.ComponentType<P>) => {
        class WithLogin extends React.Component<P> {
            public render() {
                const isShown = (!condition || condition(this.props))
                    && !this.props.session.accessToken;
                return isShown ? <LoginContainer msgId={msgId} /> :
                    <Component {...this.props} />;
            }
        }

        return WithLogin;
    };
}

export default withLogin;

import LoginContainer from "components/login-container";
import withSession, { IWithSessionProps } from "components/with-session";
import * as React from "react";
import AnalyticsContext from "utils/analytics-context";

function withLogin<P extends IWithSessionProps>(
    msgId: string,
    analyticsContext: AnalyticsContext,
    condition?: (props: P) => boolean,
) {
    return (Component: React.ComponentType<P>) => {
        class WithLogin extends React.Component<P> {
            public render() {
                const isShown = (!condition || condition(this.props))
                    && !this.props.session.accessToken;

                if (isShown) {
                    return (
                        <LoginContainer
                            msgId={msgId}
                            analyticsContext={analyticsContext}
                        />
                    );
                }

                return <Component {...this.props} />;
            }
        }

        return WithLogin;
    };
}

export default withLogin;

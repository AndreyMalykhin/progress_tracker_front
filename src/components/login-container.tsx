import Login, { ILoginProps } from "components/login";
import withDIContainer from "components/with-di-container";
import withLoginAction, {
    IWithLoginActionProps,
} from "components/with-login-action";
import * as React from "react";
import { compose, withApollo } from "react-apollo";
import AnalyticsContext from "utils/analytics-context";

interface ILoginContainerProps {
    isNoFillParent?: boolean;
    msgId?: string;
    analyticsContext: AnalyticsContext;
}

class LoginContainer extends
    React.Component<ILoginContainerProps & IWithLoginActionProps> {
    public render() {
        const { isNoFillParent, msgId } = this.props;
        return (
            <Login
                isNoFillParent={isNoFillParent}
                msgId={msgId}
                onLogin={this.onLogin}
            />
        );
    }

    private onLogin = () => this.props.onLogin(this.props.analyticsContext);
}

export default compose(
    withDIContainer,
    withApollo,
    withLoginAction,
)(LoginContainer) as React.ComponentType<ILoginContainerProps>;

import Login, { ILoginProps } from "components/login";
import withDIContainer from "components/with-di-container";
import withLoginAction from "components/with-login-action";
import { compose, withApollo } from "react-apollo";

export default compose(withDIContainer, withApollo, withLoginAction)(Login);

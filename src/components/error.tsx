import * as React from "react";
import { FormattedMessage } from "react-intl";

class Error extends React.Component {
    public render() {
        return <FormattedMessage id="errors.unexpected" />;
    }
}

export default Error;

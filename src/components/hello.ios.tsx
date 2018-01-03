import * as React from "react";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import { Text } from "react-native";

interface IProps {
    test?: string;
}

class Hello extends React.Component<IProps & InjectedIntlProps, {}> {
    public render() {
        return <FormattedMessage id={"hello"} values={{platform: "iOS"}}/>;
    }
}

export default injectIntl<IProps>(Hello);

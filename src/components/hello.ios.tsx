import * as React from "react";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import { Text, View } from "react-native";
import { Link } from "react-router-native";

interface IProps {
    test?: string;
}

class Hello extends React.Component<IProps & InjectedIntlProps, {}> {
    public render() {
        return (
            <View>
                <FormattedMessage id={"hello"} values={{platform: "iOS"}}/>
                <Link to="/"><Text style={{color: "blue"}}>Back</Text></Link>
            </View>
        );
    }
}

export default injectIntl<IProps>(Hello);

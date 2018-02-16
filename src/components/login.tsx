import Button, { ButtonTitle } from "components/button";
import { IWithLoginActionProps } from "components/with-login-action";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, Text, View } from "react-native";

interface ILoginProps {
    msgId?: string;
}

class Login extends React.Component<ILoginProps & IWithLoginActionProps> {
    public render() {
        const { msgId, onLogin } = this.props;
        const msg = msgId && (
            <Text style={styles.msg}>
                <FormattedMessage id={msgId} />
            </Text>
        );
        return (
            <View style={styles.container}>
                {msg}
                <Button style={styles.btn} onPress={onLogin}>
                    <ButtonTitle msgId="common.login" />
                </Button>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    btn: {
        alignSelf: "center",
    },
    container: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    msg: {
        lineHeight: 32,
    },
});

export { ILoginProps };
export default Login;

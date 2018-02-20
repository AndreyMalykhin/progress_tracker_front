import Button, { ButtonTitle } from "components/button";
import Image from "components/image";
import { IWithLoginActionProps } from "components/with-login-action";
import * as React from "react";
import {
    Dimensions,
    ImageURISource,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { withRouter } from "react-router";

interface ILoginPageProps extends IWithLoginActionProps {
    onSkip: () => void;
}

class LoginPage extends React.Component<ILoginPageProps> {
    public render() {
        return (
            <View style={styles.container}>
                <Image
                    source={{ uri: "https://loremflickr.com/512/512/cat" }}
                    style={styles.logo}
                />
                <Button style={styles.btn} onPress={this.props.onLogin}>
                    <ButtonTitle msgId="common.login" />
                </Button>
                <Button style={styles.btn} onPress={this.props.onSkip}>
                    <ButtonTitle msgId="intro.skip" />
                </Button>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    btn: {
        marginBottom: 8,
    },
    container: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    logo: {
        height: 128,
        marginBottom: 64,
        width: 128,
    },
});

export { ILoginPageProps };
export default LoginPage;

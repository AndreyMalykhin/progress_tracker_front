import Button, { ButtonTitle } from "components/button";
import { Gap, rem } from "components/common-styles";
import Image from "components/image";
import LoginContainer from "components/login-container";
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

interface ILoginPageProps {
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
                <LoginContainer isNoFillParent={true} />
                <Button style={styles.skipBtn} onPress={this.props.onSkip}>
                    <ButtonTitle msgId="intro.skip" />
                </Button>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    logo: {
        height: 128,
        marginBottom: rem(6.4),
        width: 128,
    },
    skipBtn: {
        marginTop: Gap.double,
    },
});

export { ILoginPageProps };
export default LoginPage;

import Button, { ButtonTitle } from "components/button";
import { Gap, rem } from "components/common-styles";
import Image from "components/image";
import LoginContainer from "components/login-container";
import { BodyText, FootnoteText } from "components/typography";
import { IWithLoginActionProps } from "components/with-login-action";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import {
    Dimensions,
    ImageURISource,
    StatusBar,
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
                <View style={styles.topContent}>
                    <Image
                        source={{ uri: "https://loremflickr.com/512/512/cat" }}
                        style={styles.logo}
                    />
                    <LoginContainer isNoFillParent={true} />
                </View>
                <Button style={styles.skipBtn} onPress={this.props.onSkip}>
                    <ButtonTitle msgId="login.skip" />
                </Button>
                <FootnoteText style={styles.skipMsg}>
                    <FormattedMessage id="login.skipMsg" />
                </FootnoteText>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flex: 1,
    },
    logo: {
        height: 128,
        marginBottom: rem(6.4),
        width: 128,
    },
    skipBtn: {
        marginTop: Gap.double,
    },
    skipMsg: {
        paddingBottom: Gap.quadruple,
        paddingLeft: Gap.quadruple,
        paddingRight: Gap.quadruple,
        textAlign: "center",
    },
    topContent: {
        flex: 1,
        justifyContent: "center",
    },
});

export { ILoginPageProps };
export default LoginPage;

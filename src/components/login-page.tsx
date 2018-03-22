import Button, { ButtonTitle } from "components/button";
import { color, gap, rem } from "components/common-styles";
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
import AnalyticsContext from "utils/analytics-context";

interface ILoginPageProps {
    onSkip: () => void;
}

class LoginPage extends React.Component<ILoginPageProps> {
    public render() {
        return (
            <View style={styles.container}>
                <View style={styles.topContent}>
                    <Image
                        source={require("images/logo.png")}
                        style={styles.logo}
                    />
                </View>
                <LoginContainer
                    isNoFillParent={true}
                    analyticsContext={AnalyticsContext.LoginPage}
                />
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
        backgroundColor: color.white,
    },
    skipBtn: {
        marginBottom: gap.double,
        marginTop: gap.double,
    },
    skipMsg: {
        paddingBottom: gap.quadruple,
        paddingLeft: gap.quadruple,
        paddingRight: gap.quadruple,
        textAlign: "center",
    },
    topContent: {
        flex: 1,
        justifyContent: "center",
    },
});

export { ILoginPageProps };
export default LoginPage;

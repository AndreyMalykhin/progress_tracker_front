import Button, { ButtonIcon, ButtonTitle } from "components/button";
import { color, gap } from "components/common-styles";
import Icon from "components/icon";
import Text from "components/text";
import { BodyText, FootnoteText } from "components/typography";
import { IWithLoginActionProps } from "components/with-login-action";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, View } from "react-native";
import IconName from "utils/icon-name";

interface ILoginProps {
    isNoFillParent?: boolean;
    msgId?: string;
    onLogin: () => void;
}

class Login extends React.Component<ILoginProps> {
    public render() {
        const { msgId, isNoFillParent, onLogin } = this.props;
        const msg = msgId && (
            <BodyText style={styles.msg}>
                <FormattedMessage id={msgId} />
            </BodyText>
        );
        const style = [
            styles.container,
            isNoFillParent && styles.containerNoFillParent,
        ];
        return (
            <View style={style as any}>
                {msg}
                <Button raised={true} style={styles.btn} onPress={onLogin}>
                    <ButtonIcon
                        raised={true}
                        component={Icon}
                        name={IconName.Facebook}
                    />
                    <ButtonTitle
                        primary={true}
                        raised={true}
                        msgId="common.loginViaFacebook"
                    />
                </Button>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    btn: {
        alignSelf: "center",
        backgroundColor: "#395ca9",
    },
    container: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    containerNoFillParent: {
        flex: 0,
    },
    msg: {
        paddingBottom: gap.double,
    },
});

export { ILoginProps };
export default Login;

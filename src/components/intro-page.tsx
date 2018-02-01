import Button, { ButtonTitle } from "components/button";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { withRouter } from "react-router";

interface IIntroPageProps  {
    onClose: () => void;
    onLogin: () => void;
}

class IntroPage extends React.Component<IIntroPageProps> {
    public render() {
        return (
            <View style={styles.container}>
                <Button onPress={this.props.onLogin}>
                    <ButtonTitle msgId="intro.login" />
                </Button>
                <Button onPress={this.props.onClose}>
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
});

export { IIntroPageProps };
export default IntroPage;

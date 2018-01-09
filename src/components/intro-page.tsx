import Button from "components/button";
import * as React from "react";
import { Text, View } from "react-native";
import { withRouter } from "react-router";

interface IIntroPageProps  {
    onClose: () => void;
    onLogin: () => void;
}

class IntroPage extends React.Component<IIntroPageProps> {
    public render() {
        return (
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Text>INTRO PAGE</Text>
                <Button onPress={this.props.onLogin}>
                    <Button.Title msgId="intro.login" />
                </Button>
                <Button onPress={this.props.onClose}>
                    <Button.Title msgId="intro.skip" />
                </Button>
            </View>
        );
    }
}

export { IIntroPageProps };
export default IntroPage;

import * as React from "react";
import { Button } from "react-native";
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
                <Button title="Login" onPress={this.props.onLogin} />
                <Button title="Skip" onPress={this.props.onClose} />
            </View>
        );
    }
}

export { IIntroPageProps };
export default IntroPage;

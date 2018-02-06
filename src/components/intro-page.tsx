import Button, { ButtonTitle } from "components/button";
import * as React from "react";
import {
    Dimensions,
    Image,
    ImageURISource,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { withRouter } from "react-router";

interface IIntroPageProps  {
    onClose: () => void;
    onLogin: () => void;
}

class IntroPage extends React.Component<IIntroPageProps> {
    private logoSource: ImageURISource;

    public constructor(props: IIntroPageProps, context: any) {
        super(props, context);
        this.logoSource = {
            height: 128,
            uri: "https://loremflickr.com/128/128/cat",
            width: 128,
        };
    }

    public render() {
        return (
            <View style={styles.container}>
                <Image source={this.logoSource} style={styles.logo} />
                <Button style={styles.btn} onPress={this.props.onLogin}>
                    <ButtonTitle msgId="common.login" />
                </Button>
                <Button style={styles.btn} onPress={this.props.onClose}>
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
        marginBottom: 24,
    },
});

export { IIntroPageProps };
export default IntroPage;

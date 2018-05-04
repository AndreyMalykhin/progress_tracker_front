import { headerStyle } from "components/common-styles";
import * as React from "react";
import {
    Platform,
    StatusBar,
    StatusBarProperties,
    StyleSheet,
    View,
} from "react-native";
import isIphoneX from "utils/is-iphone-x";

type ITopStatusBarProps = StatusBarProperties;

class TopStatusBar extends React.Component<ITopStatusBarProps> {
    public render() {
        return (
            <View style={styles.container}>
                <StatusBar hidden={false} {...this.props} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: headerStyle.backgroundColor,
        height: getHeight(),
    },
});

function getHeight() {
    if (Platform.OS === "android") {
        return StatusBar.currentHeight;
    }

    return isIphoneX() ? 44 : 20;
}

export default TopStatusBar;

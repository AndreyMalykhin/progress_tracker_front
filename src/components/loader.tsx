import * as React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, Text, View } from "react-native";

class Loader extends React.Component {
    public render() {
        return (
            <View style={styles.container}>
                <Text>...</Text>
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

export default Loader;

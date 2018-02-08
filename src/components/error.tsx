import * as React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, View } from "react-native";

class Error extends React.Component {
    public render() {
        return (
            <View style={styles.container}>
                <FormattedMessage id="errors.unexpected" />
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

export default Error;

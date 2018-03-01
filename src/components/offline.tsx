import Text from "components/text";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, View } from "react-native";

class Offline extends React.Component {
    public render() {
        return (
            <View style={styles.container}>
                <Text style={styles.msg}>
                    <FormattedMessage id="common.offline" />
                </Text>
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
    msg: {
        lineHeight: 32,
    },
});

export default Offline;

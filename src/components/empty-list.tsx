import * as React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, View } from "react-native";

class EmptyList extends React.Component {
    public render() {
        return (
            <View style={styles.container}>
                <FormattedMessage id="common.noData" />
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

export default EmptyList;

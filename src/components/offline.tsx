import Text from "components/text";
import { BodyText } from "components/typography";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, View } from "react-native";

class Offline extends React.Component {
    public render() {
        return (
            <View style={styles.container}>
                <BodyText style={styles.msg}>
                    <FormattedMessage id="common.offline" />
                </BodyText>
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
    msg: {},
});

export default Offline;

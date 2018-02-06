import * as React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

class Loader extends React.Component {
    public render() {
        return <ActivityIndicator style={styles.container} />;
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

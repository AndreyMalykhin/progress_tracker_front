import Hello from "components/hello";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

export default class App extends React.Component<{}, {}> {
  public render() {
    return (
      <View style={styles.container}>
        <Hello/>
        <Text>Open up App.js to start working on your app!</Text>
        <Text>Changes you make will automatically reload.</Text>
        <Text>Shake your phone to open the developer menu.</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
  },
});

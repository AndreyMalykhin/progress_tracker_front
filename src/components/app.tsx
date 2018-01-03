import Hello from "components/hello";
import "intl";
import * as React from "react";
import { addLocaleData, IntlProvider } from "react-intl";
import * as ru from "react-intl/locale-data/ru";
import { StyleSheet, Text, View } from "react-native";

addLocaleData(ru);
const messages = {
  hello: "Привет {platform}!",
};

export default class App extends React.Component<{}, {}> {
  public render() {
    return (
      <IntlProvider locale="ru" textComponent={Text} messages={messages}>
        <View style={styles.container}>
          <Hello/>
          <Text>Open up App.js to start working on your app!</Text>
          <Text>Changes you make will automatically reload.</Text>
          <Text>Shake your phone to open the developer menu.</Text>
        </View>
      </IntlProvider>
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

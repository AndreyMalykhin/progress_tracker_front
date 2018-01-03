import Hello from "components/hello";
import Home from "components/home";
import "intl";
import * as React from "react";
import { addLocaleData, IntlProvider } from "react-intl";
import * as ru from "react-intl/locale-data/ru";
import { StyleSheet, Text, View } from "react-native";
import { Link, NativeRouter, Route, Switch } from "react-router-native";

addLocaleData(ru);
const messages = {
  hello: "Привет {platform}!",
};

export default class App extends React.Component {
  public render() {
    return (
      <IntlProvider locale="ru" textComponent={Text} messages={messages}>
        <NativeRouter>
          <View style={styles.container}>
            <Switch>
              <Route exact={true} path="/hello" component={Hello}/>
              <Route component={Home}/>
            </Switch>
          </View>
        </NativeRouter>
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

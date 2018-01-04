import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import Hello from "components/hello";
import Home from "components/home";
import "intl";
import * as React from "react";
import { ApolloProvider } from "react-apollo";
import { addLocaleData, IntlProvider } from "react-intl";
import * as ru from "react-intl/locale-data/ru";
import { StyleSheet, Text, View } from "react-native";
import { Link, NativeRouter, Route, Switch } from "react-router-native";

addLocaleData(ru);
const messages = {
    hello: "Привет {platform}!",
};

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: "https://api.graph.cool/simple/v1/swapi" }),
});

export default class App extends React.Component {
    public render() {
        return (
            <ApolloProvider client={client}>
                <IntlProvider locale="ru" textComponent={Text} messages={messages}>
                    <NativeRouter>
                        <View style={styles.container}>
                            <Switch>
                                <Route exact={true} path="/hello" component={Hello} />
                                <Route component={Home} />
                            </Switch>
                        </View>
                    </NativeRouter>
                </IntlProvider>
            </ApolloProvider>
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

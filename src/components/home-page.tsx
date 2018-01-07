import GlobalNav from "components/global-nav";
import Header from "components/header";
import ProfileSection from "components/profile-section";
import * as React from "react";
import { View } from "react-native";
import { Redirect, Route, Switch } from "react-router";

class HomePage extends React.Component {
    public render() {
        return (
            <View style={{ flex: 1 }}>
                <Header/>
                <View style={{ flex: 1 }}>
                    <Switch>
                        <Route path="/profile/:id" component={ProfileSection} />
                        <Redirect to="/profile/me/in-progress" />
                    </Switch>
                </View>
                <GlobalNav/>
            </View>
        );
    }
}

export default HomePage;

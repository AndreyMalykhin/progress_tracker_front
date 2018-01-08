import HomePage from "components/home-page";
import IntroPageContainer from "components/intro-page-container";
import * as React from "react";
import { StatusBar, View } from "react-native";
import { Redirect, Route, Switch } from "react-router";

interface ILayoutProps {
    showIntro?: boolean;
}

class Layout extends React.Component<ILayoutProps> {
    public render() {
        return (
            <View style={{ flex: 1 }}>
                <StatusBar />
                <Switch>
                    <Route render={this.renderHomePage}/>
                </Switch>
            </View>
        );
    }

    private renderHomePage = () => {
        return this.props.showIntro ? <IntroPageContainer /> : <HomePage />;
    }
}

export { ILayoutProps };
export default Layout;

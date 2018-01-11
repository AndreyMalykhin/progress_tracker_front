import HomePage from "components/home-page";
import IntroPageContainer from "components/intro-page-container";
import TrackableEditPage from "components/trackable-edit-page";
import * as React from "react";
import { StatusBar, View } from "react-native";
import { Redirect, Route, Switch } from "react-router";
import routes from "utils/routes";

interface ILayoutProps {
    showIntro?: boolean;
}

class Layout extends React.Component<ILayoutProps> {
    public render() {
        return (
            <View style={{ flex: 1 }}>
                <StatusBar />
                <Switch>
                    <Route
                        exact={routes.trackableNew.exact}
                        path={routes.trackableNew.path}
                        component={TrackableEditPage}
                    />
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

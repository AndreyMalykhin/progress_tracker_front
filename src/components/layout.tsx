import HomePage from "components/home-page";
import IntroPageContainer from "components/intro-page-container";
import ProfileEditPage from "components/profile-edit-page";
import TrackableFormPageContainer from "components/trackable-form-page-container";
import * as React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { Redirect, Route, Switch } from "react-router";
import routes from "utils/routes";

interface ILayoutProps {
    showIntro?: boolean;
}

class Layout extends React.Component<ILayoutProps> {
    public render() {
        return (
            <View style={styles.container}>
                <StatusBar />
                <Switch>
                    <Route
                        exact={routes.trackableNew.exact}
                        path={routes.trackableNew.path}
                        component={TrackableFormPageContainer}
                    />
                    <Route
                        exact={routes.trackableEdit.exact}
                        path={routes.trackableEdit.path}
                        component={TrackableFormPageContainer}
                    />
                    <Route
                        exact={routes.profileEdit.exact}
                        path={routes.profileEdit.path}
                        component={ProfileEditPage}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
});

export { ILayoutProps };
export default Layout;

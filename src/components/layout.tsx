import HomePage from "components/home-page";
import IntroPageContainer from "components/intro-page-container";
import ProfileFormPage from "components/profile-form-page";
import StackingSwitch from "components/stacking-switch";
import ToastListContainer from "components/toast-list-container";
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
                <StackingSwitch>
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
                        component={ProfileFormPage}
                    />
                    <Route render={this.renderHomePage}/>
                </StackingSwitch>
                <ToastListContainer />
            </View>
        );
    }

    private renderHomePage = () =>
        this.props.showIntro ? <IntroPageContainer /> : <HomePage />
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
});

export { ILayoutProps };
export default Layout;

import { Color, HeaderStyle } from "components/common-styles";
import HomePage from "components/home-page";
import LoginPageContainer from "components/login-page-container";
import ProfileFormPage from "components/profile-form-page";
import StackingSwitch from "components/stacking-switch";
import ToastListContainer from "components/toast-list-container";
import TrackableFormPageContainer from "components/trackable-form-page-container";
import { IWithSessionProps } from "components/with-session";
import * as React from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { Redirect, Route, Switch } from "react-router";
import routes from "utils/routes";

// tslint:disable-next-line:no-empty-interface
interface ILayoutProps {}

class Layout extends React.Component<ILayoutProps & IWithSessionProps> {
    public render() {
        const statusBar = this.props.session.userId ? (
            <View style={styles.statusBar}>
                <StatusBar />
            </View>
        ) : <StatusBar hidden={true} />;
        return (
            <View style={styles.container}>
                {statusBar}
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
        this.props.session.userId ? <HomePage /> : <LoginPageContainer />
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statusBar: {
        backgroundColor: HeaderStyle.backgroundColor,
        height: Platform.OS === "ios" ? 20 : StatusBar.currentHeight,
    },
});

export { ILayoutProps };
export default Layout;

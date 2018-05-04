import BottomStatusBar from "components/bottom-status-bar";
import { color } from "components/common-styles";
import Header from "components/header";
import ProfileFormContainer from "components/profile-form-container";
import TopStatusBar from "components/top-status-bar";
import * as React from "react";
import { StyleSheet, View } from "react-native";

class ProfileFormPage extends React.Component {
    public render() {
        return (
            <View style={styles.container}>
                <TopStatusBar />
                <Header />
                <ProfileFormContainer />
                <BottomStatusBar isTransparent={true} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: color.white,
        flex: 1,
    },
});

export default ProfileFormPage;

import Header from "components/header";
import ProfileFormContainer from "components/profile-form-container";
import * as React from "react";
import { StyleSheet, View } from "react-native";

class ProfileFormPage extends React.Component {
    public render() {
        return (
            <View style={styles.container}>
                <Header />
                <ProfileFormContainer />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ProfileFormPage;

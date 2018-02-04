import Header from "components/header";
import ProfileFormContainer from "components/profile-form-container";
import * as React from "react";
import { View } from "react-native";

class ProfileFormPage extends React.Component {
    public render() {
        return (
            <View>
                <Header />
                <ProfileFormContainer />
            </View>
        );
    }
}

export default ProfileFormPage;

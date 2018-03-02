import Button, { ButtonTitle } from "components/button";
import { FormBody, FormGroup } from "components/form";
import FormAvatarPicker from "components/form-avatar-picker";
import FormTextInput from "components/form-text-input";
import LoginContainer from "components/login-container";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, Text } from "react-native";
import { Image } from "react-native-image-crop-picker";
import {
    KeyboardAwareScrollView,
} from "react-native-keyboard-aware-scroll-view";

interface IProfileFormProps {
    isNameDisabled?: boolean;
    name: string;
    nameError?: string|null;
    isUserLoggedIn?: boolean;
    avatarUri: string;
    avatarError?: string|null;
    isAvatarDisabled?: boolean;
    isAvatarChanging?: boolean;
    onChangeAvatar: (img: Image|null) => void;
    onChangeName: (name: string) => void;
    onLogout: () => void;
}

class ProfileForm extends React.Component<IProfileFormProps> {
    public render() {
        const {
            isNameDisabled,
            name,
            nameError,
            isUserLoggedIn,
            avatarUri,
            avatarError,
            isAvatarDisabled,
            isAvatarChanging,
            onChangeAvatar,
            onChangeName,
            onLogout,
        } = this.props;
        let authGroup;

        if (isUserLoggedIn) {
            authGroup = (
                <FormGroup>
                    <Button style={styles.logoutBtn} onPress={onLogout}>
                        <ButtonTitle msgId="common.logout" />
                    </Button>
                </FormGroup>
            );
        } else {
            authGroup = (
                <LoginContainer msgId="profileForm.loginMessage" />
            );
        }

        return (
            <KeyboardAwareScrollView contentContainerStyle={styles.container}>
                <FormBody style={styles.container}>
                    <FormAvatarPicker
                        style={styles.avatarContainer}
                        errorMsgId={avatarError}
                        disabled={isAvatarDisabled}
                        changing={isAvatarChanging}
                        uri={avatarUri}
                        onChangeImg={onChangeAvatar}
                    />
                    <FormTextInput
                        disabled={isNameDisabled}
                        errorMsgId={nameError}
                        placeholderMsgId="profileForm.namePlaceholder"
                        value={name}
                        onChangeText={onChangeName}
                    />
                    {authGroup}
                </FormBody>
            </KeyboardAwareScrollView>
        );
    }
}

const styles = StyleSheet.create({
    avatarContainer: {},
    container: {
        flex: 1,
    },
    logoutBtn: {
        alignSelf: "center",
    },
});

export default ProfileForm;

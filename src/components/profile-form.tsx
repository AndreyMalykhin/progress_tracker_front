import Button, { ButtonTitle } from "components/button";
import { FormBody, FormGroup } from "components/form";
import FormAvatarPicker from "components/form-avatar-picker";
import FormTextInput from "components/form-text-input";
import LoginContainer from "components/login-container";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, Text } from "react-native";
import { Image } from "react-native-image-crop-picker";

interface IProfileFormProps {
    isNameDisabled?: boolean;
    name: string;
    nameError?: string|null;
    isUserLoggedIn?: boolean;
    avatarUri: string;
    avatarError?: string|null;
    isAvatarDisabled?: boolean;
    onChangeAvatar: (img?: Image) => void;
    onChangeName: (name: string) => void;
    onLogin: () => void;
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
            onChangeAvatar,
            onChangeName,
            onLogin,
        } = this.props;
        const loginGroup = !isUserLoggedIn && (
            <LoginContainer msgId="profileForm.loginMessage" />
        );

        return (
            <FormBody style={styles.container}>
                <FormAvatarPicker
                    style={styles.avatarContainer}
                    errorMsgId={avatarError}
                    disabled={isAvatarDisabled}
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
                {loginGroup}
            </FormBody>
        );
    }
}

const styles = StyleSheet.create({
    avatarContainer: {
        borderBottomWidth: 1,
    },
    container: {
        flex: 1,
    },
    loginGroup: {},
});

{/* <FormGroup style={styles.loginGroup}>
                <LoginContainer msgId="profileForm.loginMessage" />
            </FormGroup> */}

export default ProfileForm;

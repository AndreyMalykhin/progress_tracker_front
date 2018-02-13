import Avatar from "components/avatar";
import Button, { ButtonTitle } from "components/button";
import { FormGroup } from "components/form";
import Image from "components/image";
import * as React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import ImagePicker, {
    Image as ImageInfo,
} from "react-native-image-crop-picker";

interface IFormAvatarPickerProps {
    style?: StyleProp<ViewStyle>;
    errorMsgId?: string|null;
    uri: string;
    disabled?: boolean;
    onChangeImg: (img?: ImageInfo) => void;
}

class FormAvatarPicker extends React.PureComponent<IFormAvatarPickerProps> {
    public render() {
        const { errorMsgId, uri, disabled, style } = this.props;
        return (
            <FormGroup
                style={[styles.container, style]}
                errorMsgId={errorMsgId}
            >
                <Avatar size="large" uri={uri!} />
                <View style={styles.buttonsContainer}>
                    <Button onPress={this.onSelect} disabled={disabled}>
                        <ButtonTitle
                            disabled={disabled}
                            msgId="common.select"
                        />
                    </Button>
                    <Button onPress={this.onRemove} disabled={disabled}>
                        <ButtonTitle
                            dangerous={true}
                            disabled={disabled}
                            msgId="common.remove"
                        />
                    </Button>
                </View>
            </FormGroup>
        );
    }

    private onSelect = async () => {
        let image;

        try {
            image = await ImagePicker.openPicker({
                includeBase64: false,
                mediaType: "photo",
            }) as ImageInfo;
        } catch (e) {
            if (e.code === "E_PICKER_CANCELLED") {
                return;
            }

            // TODO
            throw e;
        }

        if (!image) {
            return;
        }

        this.props.onChangeImg(image);
    }

    private onRemove = () => this.props.onChangeImg(undefined);
}

const styles = StyleSheet.create({
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 8,
    },
    container: {
        alignItems: "center",
    },
});

export default FormAvatarPicker;

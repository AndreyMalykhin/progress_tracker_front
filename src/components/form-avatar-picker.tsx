import Button, { ButtonTitle } from "components/button";
import { FormGroup } from "components/form";
import * as React from "react";
import { Image, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import ImagePicker, {
    Image as ImageInfo,
} from "react-native-image-crop-picker";

interface IFormAvatarPickerProps {
    style?: StyleProp<ViewStyle>;
    errorMsgId?: string|null;
    uri?: string;
    disabled?: boolean;
    onChangeImg: (img?: ImageInfo) => void;
}

const imgSize = 256;

class FormAvatarPicker extends React.PureComponent<IFormAvatarPickerProps> {
    public render() {
        const { errorMsgId, uri, disabled, style } = this.props;
        const imgSource = {
            height: imgSize, method: "cover", uri, width: imgSize,
        };
        return (
            <FormGroup
                style={[styles.container, style]}
                errorMsgId={errorMsgId}
            >
                <Image style={styles.image} source={imgSource} />
                <View style={styles.buttonsContainer}>
                    <Button onPress={this.onSelect} disabled={disabled}>
                        <ButtonTitle
                            disabled={disabled}
                            msgId="common.select"
                        />
                    </Button>
                    <Button onPress={this.onRemove} disabled={disabled}>
                        <ButtonTitle
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
    image: {
        borderRadius: imgSize / 2,
        borderWidth: 1,
    },
});

export default FormAvatarPicker;

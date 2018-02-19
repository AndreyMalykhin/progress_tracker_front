import { addGenericErrorToast } from "actions/toast-helpers";
import Avatar from "components/avatar";
import Button, { ButtonTitle } from "components/button";
import { FormGroup } from "components/form";
import Image from "components/image";
import Loader from "components/loader";
import * as React from "react";
import { withApollo } from "react-apollo";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import ImagePicker, {
    Image as ImageInfo,
} from "react-native-image-crop-picker";
import { IWithApolloProps } from "utils/interfaces";
import openImgPicker from "utils/open-img-picker";

interface IFormAvatarPickerProps {
    style?: StyleProp<ViewStyle>;
    errorMsgId?: string|null;
    uri: string;
    disabled?: boolean;
    changing?: boolean;
    onChangeImg: (img: ImageInfo|null) => void;
}

class FormAvatarPicker extends
    React.PureComponent<IFormAvatarPickerProps & IWithApolloProps> {
    public render() {
        const { errorMsgId, uri, disabled, changing, style } = this.props;
        let buttons;

        if (changing) {
            buttons = <Loader style={styles.loader} isNoFillParent={true} />;
        } else {
            buttons = (
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
            );
        }

        return (
            <FormGroup
                style={[styles.container, style]}
                errorMsgId={errorMsgId}
            >
                <Avatar size="large" uri={uri!} />
                {buttons}
            </FormGroup>
        );
    }

    private onSelect = async () => {
        let image;

        try {
            image = await openImgPicker();
        } catch (e) {
            addGenericErrorToast(this.props.client);
            return;
        }

        if (!image) {
            return;
        }

        this.props.onChangeImg(image);
    }

    private onRemove = () => this.props.onChangeImg(null);
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
    loader: {
        marginTop: 8,
    },
});

export default withApollo(FormAvatarPicker);

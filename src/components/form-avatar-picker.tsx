import { addGenericErrorToast } from "actions/toast-helpers";
import Avatar from "components/avatar";
import Button, { ButtonTitle } from "components/button";
import { cardStyle, color, gap, shadeColor } from "components/common-styles";
import { FormGroup } from "components/form";
import Image from "components/image";
import Loader from "components/loader";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import * as React from "react";
import { compose, withApollo } from "react-apollo";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import ImagePicker, {
    Image as ImageInfo,
} from "react-native-image-crop-picker";
import { IWithApolloProps } from "utils/interfaces";
import openImgPicker from "utils/open-img-picker";

interface IFormAvatarPickerProps extends
    IWithApolloProps, IWithDIContainerProps {
    style?: StyleProp<ViewStyle>;
    errorMsgId?: string|null;
    uri: string;
    disabled?: boolean;
    changing?: boolean;
    onChangeImg: (img: ImageInfo|null) => void;
}

class FormAvatarPicker extends React.PureComponent<IFormAvatarPickerProps> {
    public render() {
        const { errorMsgId, uri, disabled, changing, style } = this.props;
        let buttons;

        if (changing) {
            buttons = (
                <Loader
                    style={styles.loader}
                    isNoFillParent={true}
                    size="small"
                />
            );
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
        const { diContainer, client, onChangeImg } = this.props;

        try {
            image = await openImgPicker(diContainer.audioManager);
        } catch (e) {
            addGenericErrorToast(client);
            return;
        }

        if (!image) {
            return;
        }

        onChangeImg(image);
    }

    private onRemove = () => this.props.onChangeImg(null);
}

const styles = StyleSheet.create({
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: gap.single,
    },
    container: {
        alignItems: "center",
        backgroundColor: shadeColor.light2,
        borderBottomWidth: 1,
        borderColor: shadeColor.light3,
    },
    loader: {
        marginTop: gap.single,
    },
});

export default compose(withApollo, withDIContainer)(FormAvatarPicker);

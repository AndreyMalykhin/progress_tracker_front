import { BorderRadius, Color, rem } from "components/common-styles";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import ModalImpl, { ModalProps } from "react-native-modal";

type IModalProps = ModalProps;

class Modal extends React.Component<IModalProps> {
    public render() {
        const { children, ...restProps } = this.props;
        return (
            <ModalImpl
                useNativeDriver={true}
                style={styles.container}
                avoidKeyboard={true}
                {...restProps}
            >
                <View style={styles.content}>{children}</View>
            </ModalImpl>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        backgroundColor: Color.white,
        borderRadius: BorderRadius.single,
        minWidth: rem(25.6),
    },
});

export default Modal;

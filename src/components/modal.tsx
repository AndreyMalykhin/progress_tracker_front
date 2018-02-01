import * as React from "react";
import { StyleSheet, View } from "react-native";
import ModalImpl, { ModalProps } from "react-native-modal";

type IModalProps = ModalProps;

class Modal extends React.Component<IModalProps> {
    public render() {
        const { children, ...restProps } = this.props;
        return (
            <ModalImpl
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
        backgroundColor: "#fff",
        borderRadius: 4,
        minWidth: 256,
    },
});

export default Modal;

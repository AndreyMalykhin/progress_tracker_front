import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

interface IToastProps {
    duration?: number;
    onClose: () => void;
}

class Toast extends React.Component<IToastProps> {
    public static defaultProps = {
        duration: 8000,
    } as IToastProps;

    private timeoutId: number;

    public render() {
        return (
            <View pointerEvents="box-none" style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.msg}>
                        {this.props.children}
                    </Text>
                </View>
            </View>
        );
    }

    public componentDidMount() {
        const { duration, onClose } = this.props;
        this.timeoutId = setTimeout(onClose, duration);
    }

    public componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: "#000",
        borderRadius: 8,
        margin: 8,
        minWidth: 256,
        paddingBottom: 8,
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 8,
    },
    msg: {
        color: "#fff",
        lineHeight: 32,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "flex-end",
    },
});

export default Toast;

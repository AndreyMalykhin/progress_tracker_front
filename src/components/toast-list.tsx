import Toast from "components/toast";
import * as React from "react";
import { StyleSheet, View } from "react-native";

interface IToastListProps {
    items: IToastListItem[];
    onCloseToast: (index: number) => void;
}

interface IToastListItem {
    msg: React.ReactNode;
}

class ToastList extends React.PureComponent<IToastListProps> {
    private nextToastId = 1;

    public render() {
        const { items } = this.props;

        if (!items.length) {
            return null;
        }

        return (
            <View pointerEvents="box-none" style={styles.container}>
                <Toast key={this.nextToastId} onClose={this.onCloseToast}>
                    {items[0].msg}
                </Toast>
            </View>
        );
    }

    private onCloseToast = () => {
        ++this.nextToastId;
        this.props.onCloseToast(0);
    }
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "flex-end",
    },
});

export { IToastListItem };
export default ToastList;

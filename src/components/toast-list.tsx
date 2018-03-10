import { rem } from "components/common-styles";
import Toast, { ToastSeverity } from "components/toast";
import * as React from "react";
import { StyleSheet, View } from "react-native";

interface IToastListProps {
    items: IToastListItem[];
    onCloseToast: (index: number) => void;
    onOpenToast: (index: number) => void;
}

interface IToastListItem {
    msg: string;
    severity: ToastSeverity;
}

class ToastList extends React.PureComponent<IToastListProps> {
    private nextToastId = 1;

    public render() {
        const { items } = this.props;

        if (!items.length) {
            return null;
        }

        const item = items[0];
        return (
            <View pointerEvents="box-none" style={styles.container}>
                <Toast
                    key={this.nextToastId}
                    severity={item.severity}
                    onClose={this.onCloseToast}
                    onOpen={this.onOpenToast}
                >
                    {item.msg}
                </Toast>
            </View>
        );
    }

    private onCloseToast = () => {
        ++this.nextToastId;
        const index = 0;
        this.props.onCloseToast(index);
    }

    private onOpenToast = () => {
        const index = 0;
        this.props.onOpenToast(index);
    }
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: rem(6.4),
    },
});

export { IToastListItem };
export default ToastList;

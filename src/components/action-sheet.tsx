import Touchable from "components/touchable";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, Text, View } from "react-native";
import Modal from "react-native-modal";

// tslint:disable-next-line:interface-over-type-literal
type IMsgValues = { [key: string]: string };

interface IActionSheetOption {
    id: string|number;
    msgId: string;
    msgValues?: IMsgValues;
}

interface IActionSheetProps {
    isOpen: boolean;
    titleMsgId: string;
    titleMsgValues?: IMsgValues;
    options: IActionSheetOption[];
    onSelect: (id?: string|number) => void;
}

interface IOptionProps extends IActionSheetOption {
    onPress: (id: string|number) => void;
}

class Option extends React.Component<IOptionProps> {
    public render() {
        const { msgId, msgValues } = this.props;
        return (
            <Touchable onPress={this.onPress} style={styles.option}>
                <FormattedMessage id={msgId} values={msgValues} />
            </Touchable>
        );
    }

    private onPress = () => this.props.onPress(this.props.id);
}

// tslint:disable-next-line:max-classes-per-file
class ActionSheet extends React.Component<IActionSheetProps> {
    public render() {
        const { options, titleMsgId, titleMsgValues, isOpen, onSelect } =
            this.props;
        const optionElements = options.map((option) => {
            const { id, msgId, msgValues } = option;
            return (
                <Option
                    key={id}
                    id={id}
                    msgId={msgId}
                    msgValues={msgValues}
                    onPress={onSelect}
                />
            );
        });
        const cancelBtn = (
            <Touchable onPress={this.onCancel} style={styles.cancelBtn}>
                <FormattedMessage id="common.cancel"/>
            </Touchable>
        );
        const title = (
            <View style={styles.titleContainer}>
                <FormattedMessage id={titleMsgId} values={titleMsgValues} />
            </View>
        );
        return (
            <Modal isVisible={isOpen} style={styles.container}>
                {title}
                <View style={styles.optionList}>{optionElements}</View>
                {cancelBtn}
            </Modal>
        );
    }

    private onCancel = () => this.props.onSelect(undefined);
}

const styles = StyleSheet.create({
    cancelBtn: {},
    container: {
        backgroundColor: "#fff",
        bottom: 0,
        flex: 0,
        left: 0,
        position: "absolute",
        right: 0,
    },
    option: {
        borderBottomWidth: 1,
    },
    optionList: {},
    titleContainer: {
        borderBottomWidth: 1,
    },
});

export { IActionSheetProps, IActionSheetOption };
export default ActionSheet;

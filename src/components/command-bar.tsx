import ActionSheet from "components/action-sheet";
import Button, { ButtonIcon } from "components/button";
import * as React from "react";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface ICommandBarItem {
    msgId: string;
    msgValues?: { [key: string]: string};
    run: () => void;
}

interface ICommandBarProps {
    style?: StyleProp<ViewStyle>;
    isDisabled?: boolean;
    items: ICommandBarItem[];
    titleMsgId: string;
}

class CommandBar extends
    React.PureComponent<ICommandBarProps & InjectedIntlProps> {
    public render() {
        const { style, isDisabled } = this.props;
        return (
            <Button
                style={[styles.button, style]}
                disabled={isDisabled}
                onPress={this.onOpen}
            >
                <ButtonIcon
                    disabled={isDisabled}
                    style={styles.buttonIcon}
                    name="dots-horizontal"
                    component={Icon}
                />
            </Button>
        );
    }

    private onOpen = () => {
        const { items, titleMsgId, intl } = this.props;
        const options = items.map((item, i) => {
            return {
                id: i,
                msgId: item.msgId,
                msgValues: item.msgValues,
            };
        });
        ActionSheet.open({
            onClose: this.onClose,
            options,
            titleMsgId,
            translator: intl,
        });
    }

    private onClose = (itemIndex?: number) => {
        if (itemIndex == null) {
            return;
        }

        this.props.items[itemIndex].run();
    }
}

const styles = StyleSheet.create({
    button: {
        padding: 0,
    },
    buttonIcon: {
        color: "#000",
    },
});

export { ICommandBarProps, ICommandBarItem };
export default injectIntl(CommandBar);

import ActionSheet from "components/action-sheet";
import Button, { ButtonIcon } from "components/button";
import { iconStyle } from "components/common-styles";
import Icon from "components/icon";
import * as React from "react";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import IconName from "utils/icon-name";

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
                style={[styles.btn, style]}
                disabled={isDisabled}
                onPress={this.onOpen}
            >
                <ButtonIcon
                    active={false}
                    disabled={isDisabled}
                    name={IconName.Commands}
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
    btn: {
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
    },
});

export { ICommandBarProps, ICommandBarItem };
export default injectIntl(CommandBar);

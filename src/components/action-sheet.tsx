import ActionSheetImpl from "@yfuks/react-native-action-sheet";
import { InjectedIntl } from "react-intl";

interface IMsgValues {
    [key: string]: string;
}

interface IActionSheetOption<TId> {
    id?: TId;
    msgId: string;
    msgValues?: IMsgValues;
}

interface IOpenParams<TOptionId> {
    translator: InjectedIntl;
    titleMsgId: string;
    titleMsgValues?: IMsgValues;
    options: Array< IActionSheetOption<TOptionId> >;
    onClose: (id?: TOptionId) => void;
}

function getMsg(id: string, translator: InjectedIntl) {
    return translator.formatMessage({ id });
}

class ActionSheet {
    public static open<TOptionId>(params: IOpenParams<TOptionId>) {
        const { options, titleMsgId, onClose, translator } = params;
        const newOptions = [...options, { msgId: "common.cancel" } ];
        ActionSheetImpl.showActionSheetWithOptions({
            cancelButtonIndex: newOptions.length - 1,
            options: newOptions.map(
                (option) => getMsg(option.msgId, translator)),
            title: getMsg(titleMsgId, translator),
        }, (optionIndex) => {
            onClose(newOptions[optionIndex].id);
        });
    }
}

export { IActionSheetOption };
export default ActionSheet;

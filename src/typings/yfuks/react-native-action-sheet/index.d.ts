declare module "@yfuks/react-native-action-sheet" {
    interface IOptions {
        options: string[];
        title: string;
        cancelButtonIndex?: number;
        destructiveButtonIndex?: number;
        tintColor?: string;
        message?: string;
    }

    type IOnClose = (optionIndex: number) => void;

    declare class ActionSheet {
        public static showActionSheetWithOptions(
            options: IOptions, onClose: IOnClose): void;
    }

    export default ActionSheet;
}

import {
    FormBody,
    FormButtonCancel,
    FormButtonOk,
    FormFooter,
} from "components/form";
import FormTextInput from "components/form-text-input";
import Modal from "components/modal";
import * as React from "react";
import { TextInput } from "react-native";

interface INumericalEntryPopupProps {
    isValid: boolean;
    entry?: string;
    entryError?: string|null;
    onSubmit: () => void;
    onCancel: () => void;
    onChangeEntry: (value: string) => void;
}

class NumericalEntryPopup
    extends React.Component<INumericalEntryPopupProps> {
    public render() {
        const {
            isValid,
            entry,
            entryError,
            onSubmit,
            onCancel,
            onChangeEntry,
        } = this.props;
        return (
            <Modal isVisible={true} onBackdropPress={onCancel}>
                <FormBody>
                    <FormTextInput
                        placeholderMsgId="numericalEntryForm.entry"
                        autoFocus={true}
                        keyboardType="numeric"
                        onChangeText={onChangeEntry}
                        value={entry}
                        errorMsgId={entryError}
                    />
                </FormBody>
                <FormFooter>
                    <FormButtonCancel onPress={onCancel}/>
                    <FormButtonOk disabled={!isValid} onPress={onSubmit} />
                </FormFooter>
            </Modal>
        );
    }
}

export { INumericalEntryPopupProps };
export default NumericalEntryPopup;

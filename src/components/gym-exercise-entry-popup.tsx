import {
    FormBody,
    FormButtonCancel,
    FormButtonOk,
    FormFooter,
} from "components/form";
import FormTextInput from "components/form-text-input";
import Modal from "components/modal";
import * as React from "react";
import Sound from "utils/sound";

interface IGymExerciseEntryPopupResult {
    date: number;
    setCount: number;
    repetitionCount: number;
    weight: number;
}

interface IGymExerciseEntryPopupProps {
    isValid: boolean;
    setCount?: string;
    setCountError?: string|null;
    repetitionCount?: string;
    repetitionCountError?: string|null;
    weight?: string;
    weightError?: string|null;
    onSubmit: () => void;
    onCancel: () => void;
    onChangeSetCount: (value: string) => void;
    onChangeRepetitionCount: (value: string) => void;
    onChangeWeight: (value: string) => void;
}

class GymExerciseEntryPopup
    extends React.Component<IGymExerciseEntryPopupProps> {
    public render() {
        const {
            isValid,
            setCount,
            setCountError,
            repetitionCount,
            repetitionCountError,
            weight,
            weightError,
            onSubmit,
            onCancel,
            onChangeSetCount,
            onChangeRepetitionCount,
            onChangeWeight,
        } = this.props;
        return (
            <Modal isVisible={true} onBackdropPress={onCancel}>
                <FormBody>
                    <FormTextInput
                        autoFocus={true}
                        placeholderMsgId="gymExerciseEntryForm.setCountPlaceholder"
                        keyboardType="numeric"
                        onChangeText={onChangeSetCount}
                        value={setCount}
                        errorMsgId={setCountError}
                    />
                    <FormTextInput
                        placeholderMsgId="gymExerciseEntryForm.repetitionCountPlaceholder"
                        keyboardType="numeric"
                        onChangeText={onChangeRepetitionCount}
                        value={repetitionCount}
                        errorMsgId={repetitionCountError}
                    />
                    <FormTextInput
                        placeholderMsgId="gymExerciseEntryForm.weightPlaceholder"
                        keyboardType="numeric"
                        onChangeText={onChangeWeight}
                        value={weight}
                        errorMsgId={weightError}
                    />
                </FormBody>
                <FormFooter>
                    <FormButtonCancel onPress={onCancel}/>
                    <FormButtonOk
                        sound={Sound.ProgressChange}
                        disabled={!isValid}
                        onPress={onSubmit}
                    />
                </FormFooter>
            </Modal>
        );
    }
}

export { IGymExerciseEntryPopupProps, IGymExerciseEntryPopupResult };
export default GymExerciseEntryPopup;

import TrackableForm from "components/trackable-form";
import Type from "models/type";
import * as React from "react";

interface IGymExerciseFormProps {
    title: string;
    titleError?: string|null;
    iconName: string;
    availableIconNames: string[];
    isPublic: boolean;
    isPublicDisabled: boolean;
    isIconPickerOpen?: boolean;
    onOpenIconPicker: () => void;
    onChangeTitle: (value: string) => void;
    onChangePublic: (value: boolean) => void;
    onChangeIcon: (name: string) => void;
}

class GymExerciseForm extends React.Component<IGymExerciseFormProps> {
    public render() {
        return (
            <TrackableForm
                titleLabelMsgId="gymExerciseForm.titleLabel"
                titlePlaceholderMsgId="gymExerciseForm.titlePlaceholder"
                {...this.props}
            />
        );
    }
}

export default GymExerciseForm;
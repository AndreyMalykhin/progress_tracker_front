import PrimitiveTrackableForm from "components/primitive-trackable-form";
import Type from "models/type";
import * as React from "react";

interface IGymExerciseFormProps {
    title?: string;
    titleError?: string|null;
    iconName: string;
    availableIconNames: string[];
    isPublic: boolean;
    isPublicDisabled: boolean;
    isIconPickerOpen?: boolean;
    isShareable?: boolean;
    isShareDisabled?: boolean;
    share?: boolean;
    onChangeShare: (share: boolean) => void;
    onOpenIconPicker: () => void;
    onChangeTitle: (value: string) => void;
    onChangePublic: (value: boolean) => void;
    onChangeIcon: (name: string) => void;
}

class GymExerciseForm extends React.Component<IGymExerciseFormProps> {
    public render() {
        return (
            <PrimitiveTrackableForm
                titleLabelMsgId="gymExerciseForm.titleLabel"
                titlePlaceholderMsgId="gymExerciseForm.titlePlaceholder"
                {...this.props}
            />
        );
    }
}

export default GymExerciseForm;

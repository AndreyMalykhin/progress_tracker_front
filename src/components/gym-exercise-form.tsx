import Type from "models/type";
import * as React from "react";

interface IGymExerciseFormProps {
    title: string;
    titleError?: string|null;
    iconName: string;
    isPublic: boolean;
    isNew: boolean;
    onChangeTitle: (value: string) => void;
    onChangePublic: (value: boolean) => void;
    onChangeIcon: (name: string) => void;
}

class GymExerciseForm extends React.Component<IGymExerciseFormProps> {
    public render() {
        // TODO
        return null;
    }
}

export default GymExerciseForm;

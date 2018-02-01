import ProgressDisplayMode from "models/progress-display-mode";
import * as React from "react";
import Difficulty from "utils/difficulty";

interface INumericalGoalFormProps {
    title: string;
    titleError?: string|null;
    iconName: string;
    isPublic: boolean;
    difficulty: Difficulty;
    deadlineDate?: Date;
    progressDisplayMode: ProgressDisplayMode;
    maxProgress: number;
    isExpanded: boolean;
    isValid: boolean;
    isNew: boolean;
    onChangeTitle: (value: string) => void;
    onChangeDifficulty: (value: number) => void;
    onChangePublic: (value: boolean) => void;
    onChangeExpanded: (value: boolean) => void;
    onChangeIcon: (name: string) => void;
    onChangeDeadlineDate: (value: Date) => void;
    onChangeProgressDisplayMode: (value: ProgressDisplayMode) => void;
    onChangeMaxProgress: (value: number) => void;
}

class NumericalGoalForm extends React.Component<INumericalGoalFormProps> {
    public render() {
        // TODO
        return null;
    }
}

export default NumericalGoalForm;

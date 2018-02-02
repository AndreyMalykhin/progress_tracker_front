import FormTextInput from "components/form-text-input";
import GoalForm from "components/goal-form";
import ProgressDisplayMode from "models/progress-display-mode";
import * as React from "react";
import Difficulty from "utils/difficulty";

interface INumericalGoalFormProps {
    availableIconNames: string[];
    title: string;
    titleError?: string|null;
    iconName: string;
    isPublic: boolean;
    isPublicDisabled: boolean;
    difficulty: Difficulty;
    deadlineDate?: Date;
    progressDisplayMode: ProgressDisplayMode;
    maxProgress?: string;
    maxProgressError?: string|null;
    isMaxProgressDisabled?: boolean;
    isExpanded: boolean;
    isValid: boolean;
    minDeadlineDate: Date;
    isIconPickerOpen?: boolean;
    onChangeTitle: (value: string) => void;
    onChangeDifficulty: (value: Difficulty) => void;
    onChangePublic: (value: boolean) => void;
    onChangeExpanded: (value: boolean) => void;
    onChangeIcon: (name: string) => void;
    onChangeDeadlineDate: (value?: Date) => void;
    onChangeProgressDisplayMode: (value: ProgressDisplayMode) => void;
    onChangeMaxProgress: (value: string) => void;
    onNumberToDifficulty: (difficulty: number) => Difficulty;
    onDifficultyToNumber: (difficulty: Difficulty) => number;
    onGetDifficultyTitleMsgId: (difficulty: Difficulty) => string;
    onOpenIconPicker: () => void;
}

class NumericalGoalForm extends React.Component<INumericalGoalFormProps> {
    public render() {
        return (
            <GoalForm
                onRenderChildren={this.onRenderChildren}
                {...this.props}
            />
        );
    }

    private onRenderChildren = () => {
        const {
            maxProgress,
            maxProgressError,
            isMaxProgressDisabled,
            onChangeMaxProgress,
        } = this.props;
        return (
            <FormTextInput
                keyboardType="numeric"
                labelMsgId="numericalGoalForm.maxProgressLabel"
                placeholderMsgId="numericalGoalForm.maxProgressPlaceholder"
                value={maxProgress}
                errorMsgId={maxProgressError}
                disabled={isMaxProgressDisabled}
                onChangeText={onChangeMaxProgress}
            />
        );
    }
}

export default NumericalGoalForm;

import { IGoalFormProps } from "components/goal-form";
import PrimitiveTrackableFormContainer, {
    IEditPrimitiveTrackableFragment,
    IPrimitiveTrackable,
    IPrimitiveTrackableFormContainerProps,
    IPrimitiveTrackableFormContainerState,
} from "components/primitive-trackable-form-container";
import { debounce, throttle } from "lodash";
import Difficulty from "models/difficulty";
import ProgressDisplayMode from "models/progress-display-mode";
import * as React from "react";
import { LayoutAnimation } from "react-native";
import formSaveDelay from "utils/form-save-delay";

interface IGoal extends IPrimitiveTrackable {
    difficulty: Difficulty;
    progressDisplayMode: ProgressDisplayMode;
    deadlineDate?: number|null;
}

interface IEditGoalFragment extends IEditPrimitiveTrackableFragment {
    difficulty?: Difficulty;
    progressDisplayMode?: ProgressDisplayMode;
    deadlineDate?: number|null;
}

type IGoalFormContainerProps<T extends IGoal> =
    IPrimitiveTrackableFormContainerProps<T>;

interface IGoalFormContainerState extends
    IPrimitiveTrackableFormContainerState {
    difficulty: Difficulty;
    deadlineDate?: Date;
    progressDisplayMode: ProgressDisplayMode;
    isExpanded?: boolean;
}

const difficultyToNumber: { [difficulty: string]: number } = {
    [Difficulty.Easy]: 0,
    [Difficulty.Medium]: 1,
    [Difficulty.Hard]: 2,
    [Difficulty.Impossible]: 3,
};

const numberToDifficulty: { [num: number]: Difficulty } = {
    0: Difficulty.Easy,
    1: Difficulty.Medium,
    2: Difficulty.Hard,
    3: Difficulty.Impossible,
};

const difficultyToMsgId: { [difficulty: string]: string } = {
    [Difficulty.Easy]: "difficulties.easy",
    [Difficulty.Medium]: "difficulties.medium",
    [Difficulty.Hard]: "difficulties.hard",
    [Difficulty.Impossible]: "difficulties.impossible",
};

abstract class GoalFormContainer<
    TGoal extends IGoal,
    TEditGoalFragment extends IEditGoalFragment,
    TProps extends IGoalFormContainerProps<TGoal>,
    TState extends IGoalFormContainerState
> extends PrimitiveTrackableFormContainer<
    TGoal, TEditGoalFragment, TProps, TState
> {
    protected minDeadlineDate: Date;

    public constructor(props: TProps, context: any) {
        super(props, context);
        this.onChangeDifficulty =
            throttle(this.onChangeDifficulty, formSaveDelay);
        this.saveDifficulty = debounce(this.saveDifficulty, this.saveDelay);
        this.minDeadlineDate = new Date();
        this.minDeadlineDate.setDate(this.minDeadlineDate.getDate() + 1);
        Object.assign(this.state, {
            difficulty: Difficulty.Easy,
            progressDisplayMode: ProgressDisplayMode.Percentage,
        });
    }

    protected getFormBaseProps() {
        const {
            difficulty,
            deadlineDate,
            progressDisplayMode,
            isExpanded,
        } = this.state;
        return {
            ...super.getFormBaseProps(),
            deadlineDate,
            difficulty,
            isExpanded,
            minDeadlineDate: this.minDeadlineDate,
            onChangeDeadlineDate: this.onChangeDeadlineDate,
            onChangeDifficulty: this.onChangeDifficulty,
            onChangeExpanded: this.onChangeExpanded,
            onChangeProgressDisplayMode: this.onChangeProgressDisplayMode,
            onDifficultyToNumber: this.onDifficultyToNumber,
            onGetDifficultyTitleMsgId: this.onGetDifficultyTitleMsgId,
            onNumberToDifficulty: this.onNumberToDifficulty,
            progressDisplayMode,
        } as IGoalFormProps;
    }

    protected onChangeExpanded = (isExpanded: boolean) => {
        LayoutAnimation.easeInEaseOut();
        this.setState({ isExpanded });
    }

    protected onChangeDifficulty = (difficulty: Difficulty) => {
        this.setState({ difficulty });

        if (this.isNew()) {
            return;
        }

        this.saveDifficulty(difficulty);
    }

    protected onChangeDeadlineDate = (deadlineDate?: Date) => {
        this.setState({ deadlineDate });

        if (this.isNew()) {
            return;
        }

        const trackableFragment = {
            deadlineDate: deadlineDate ? deadlineDate.getTime() : null,
        } as TEditGoalFragment;
        this.editTrackable(trackableFragment);
    }

    protected onChangeProgressDisplayMode = (
        progressDisplayMode: ProgressDisplayMode,
    ) => {
        this.setState({ progressDisplayMode });

        if (this.isNew()) {
            return;
        }

        this.editTrackable({ progressDisplayMode } as TEditGoalFragment);
    }

    protected onDifficultyToNumber = (difficulty: Difficulty) => {
        return difficultyToNumber[difficulty];
    }

    protected onNumberToDifficulty = (difficulty: number) => {
        return numberToDifficulty[Math.round(difficulty)];
    }

    protected onGetDifficultyTitleMsgId = (difficulty: Difficulty) => {
        return difficultyToMsgId[difficulty];
    }

    private saveDifficulty = (difficulty: Difficulty) => {
        this.editTrackable({ difficulty } as TEditGoalFragment );
    }
}

export { IGoal, IGoalFormContainerProps, IGoalFormContainerState };
export default GoalFormContainer;

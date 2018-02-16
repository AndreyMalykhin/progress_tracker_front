import TrackableFormContainer, {
    ITrackable,
    ITrackableFormContainerProps,
    ITrackableFormContainerState,
} from "components/trackable-form-container";
import { debounce, throttle } from "lodash";
import Difficulty from "models/difficulty";
import ProgressDisplayMode from "models/progress-display-mode";
import * as React from "react";

interface IGoal extends ITrackable {
    difficulty: Difficulty;
    progressDisplayMode: ProgressDisplayMode;
    deadlineDate?: number;
}

type IGoalFormContainerProps<T extends IGoal> = ITrackableFormContainerProps<T>;

interface IGoalFormContainerState extends ITrackableFormContainerState {
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
    TProps extends IGoalFormContainerProps<TGoal>,
    TState extends IGoalFormContainerState
> extends TrackableFormContainer<TGoal, TProps, TState> {
    protected minDeadlineDate: Date;

    public constructor(props: TProps, context: any) {
        super(props, context);
        this.onChangeDifficulty = throttle(this.onChangeDifficulty, 256);
        this.onSaveDifficulty = debounce(this.onSaveDifficulty, this.saveDelay);
        this.minDeadlineDate = new Date();
        this.minDeadlineDate.setDate(this.minDeadlineDate.getDate() + 1);
        Object.assign(this.state, {
            difficulty: Difficulty.Easy,
            progressDisplayMode: ProgressDisplayMode.Percentage,
        });
    }

    protected abstract saveDifficulty(difficulty: Difficulty): void;
    protected abstract saveDeadlineDate(date: number|null): void;
    protected abstract saveProgressDisplayMode(mode: ProgressDisplayMode): void;

    protected onChangeExpanded = (isExpanded: boolean) => {
        this.setState({ isExpanded });
    }

    protected onChangeDifficulty = (difficulty: Difficulty) => {
        this.setState({ difficulty });

        if (this.isNew()) {
            return;
        }

        this.onSaveDifficulty(difficulty);
    }

    protected onChangeDeadlineDate = (deadlineDate?: Date) => {
        this.setState({ deadlineDate });

        if (this.isNew()) {
            return;
        }

        this.saveDeadlineDate(deadlineDate ? deadlineDate.getTime() : null);
    }

    protected onChangeProgressDisplayMode = (
        progressDisplayMode: ProgressDisplayMode,
    ) => {
        this.setState({ progressDisplayMode });

        if (this.isNew()) {
            return;
        }

        this.saveProgressDisplayMode(progressDisplayMode);
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

    private onSaveDifficulty = (difficulty: Difficulty) => {
        this.saveDifficulty(difficulty);
    }
}

export { IGoal, IGoalFormContainerProps, IGoalFormContainerState };
export default GoalFormContainer;

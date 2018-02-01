import NumericalGoalForm from "components/numerical-goal-form";
import ProgressDisplayMode from "models/progress-display-mode";
import Type from "models/type";
import * as React from "react";
import Difficulty from "utils/difficulty";

interface INumericalGoal {
    __typename: Type;
    id: string;
    title: string;
    iconName: string;
    isPublic: boolean;
    difficulty: Difficulty;
    deadlineDate?: number;
    progressDisplayMode: ProgressDisplayMode;
    maxProgress: number;
}

interface INumericalGoalFormContainerProps {
    trackable?: INumericalGoal;
    isUserLoggedIn: boolean;
}

class NumericalGoalFormContainer extends
    React.Component<INumericalGoalFormContainerProps> {
    public render() {
        // TODO
        return null;
    }
}

export { INumericalGoal };
export default NumericalGoalFormContainer;

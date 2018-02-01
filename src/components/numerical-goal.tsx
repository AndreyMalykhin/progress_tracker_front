import IGoalProps from "components/goal-props";
import ProgressBar from "components/progress-bar";
import Trackable from "components/trackable";
import * as React from "react";
import { Text } from "react-native";

type INumericalGoalProps = IGoalProps;

class NumericalGoal extends React.PureComponent<INumericalGoalProps> {
    public render() {
        const {
            progress,
            maxProgress,
            progressDisplayMode,
            ...restProps,
        } = this.props;
        return (
            <Trackable {...restProps}>
                <ProgressBar
                    value={progress}
                    maxValue={maxProgress}
                    mode={progressDisplayMode}
                />
            </Trackable>
        );
    }
}

export { INumericalGoalProps };
export default NumericalGoal;

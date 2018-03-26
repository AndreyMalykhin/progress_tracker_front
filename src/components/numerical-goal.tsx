import IGoalProps from "components/goal-props";
import ProgressBar from "components/progress-bar";
import TouchableWithFeedback from "components/touchable-with-feedback";
import Trackable from "components/trackable";
import * as React from "react";
import { Text } from "react-native";

interface INumericalGoalProps extends IGoalProps {
    onPressProgress?: (id: string) => void;
}

class NumericalGoal extends React.PureComponent<INumericalGoalProps> {
    public render() {
        const {
            progress,
            maxProgress,
            progressDisplayMode,
            isDisabled,
            onPressProgress,
            ...restProps,
        } = this.props;
        return (
            <Trackable isDisabled={isDisabled} {...restProps}>
                <TouchableWithFeedback
                    disabled={isDisabled || !onPressProgress}
                    onPress={this.onPressProgress}
                >
                    <ProgressBar
                        value={progress}
                        maxValue={maxProgress}
                        mode={progressDisplayMode}
                    />
                </TouchableWithFeedback>
            </Trackable>
        );
    }

    private onPressProgress = () => {
        const { onPressProgress, id } = this.props;
        onPressProgress!(id);
    }
}

export { INumericalGoalProps };
export default NumericalGoal;

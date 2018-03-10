import CheckBox from "components/check-box";
import { ICommandBarItem } from "components/command-bar";
import {
    Color,
    Gap,
    ProgressBarStyle,
    rem,
    TouchableStyle,
} from "components/common-styles";
import IGoalProps from "components/goal-props";
import ProgressBar from "components/progress-bar";
import Text from "components/text";
import Trackable from "components/trackable";
import { BodyText } from "components/typography";
import { memoize } from "lodash";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import Sound from "utils/sound";

interface ITask {
    id: string;
    title: string;
    isDone: boolean;
}

interface ITaskGoalProps extends IGoalProps {
    tasks: ITask[];
    visibleTaskCount: number;
    isExpanded?: boolean;
    isExpandable?: boolean;
    onExpandChange: (id: string, isExpanded: boolean) => void;
    onSetTaskDone?: (taskId: string, isDone: boolean) => void;
}

interface ITaskProps {
    id: string;
    title: string;
    isDone?: boolean;
    isDisabled?: boolean;
    onSetDone?: (id: string, isDone: boolean) => void;
}

class TaskGoal extends React.PureComponent<ITaskGoalProps> {
    public render() {
        const {
            tasks,
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
                {this.renderTasks()}
            </Trackable>
        );
    }

    private renderTasks() {
        const { tasks, visibleTaskCount, isDisabled, isBatchEditMode, status } =
            this.props;
        const output = [];
        const isPendingProof = status === TrackableStatus.PendingProof;

        for (let i = 0; i < visibleTaskCount; ++i) {
            output.push(this.renderTask(
                tasks[i], isDisabled!, isBatchEditMode!, isPendingProof));
        }

        return <View>{output}</View>;
    }

    private renderTask(
        task: ITask,
        isDisabled: boolean,
        isBatchEditMode: boolean,
        isPendingProof: boolean,
    ) {
        const { id, isDone, title } = task;
        return (
            <Task
                key={id}
                id={id}
                isDone={isDone}
                isDisabled={isDisabled || isBatchEditMode || isPendingProof}
                title={title}
                onSetDone={this.props.onSetTaskDone}
            />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class Task extends React.PureComponent<ITaskProps> {
    public render() {
        const { isDone, title, isDisabled, onSetDone } = this.props;
        const titleStyle = isDone ? taskTitleDoneStyle : styles.taskTitle;
        return (
            <View style={styles.task}>
                <CheckBox
                    isAnimationDisabled={true}
                    isDisabled={isDisabled}
                    isChecked={isDone}
                    sound={Sound.ProgressChange}
                    iconCheckedStyle={styles.taskCheckBoxChecked}
                    onPress={onSetDone && this.onPress}
                >
                    <BodyText style={titleStyle} disabled={isDone}>
                        {title}
                    </BodyText>
                </CheckBox>
            </View>
        );
    }

    private onPress = (isChecked: boolean) => {
        const { onSetDone, id } = this.props;
        onSetDone!(id, isChecked);
    }
}

const styles = StyleSheet.create({
    task: {
        paddingBottom: Gap.single,
    },
    taskCheckBoxChecked: {
        color: ProgressBarStyle.color,
    },
    taskTitle: {
        alignSelf: "flex-start",
        flex: 1,
        flexWrap: "wrap",
        paddingLeft: Gap.single,
        paddingTop: rem(1.2),
    },
    taskTitleDone: {
        textDecorationLine: "line-through",
    },
});

const taskTitleDoneStyle = [styles.taskTitle, styles.taskTitleDone];

export { ITaskGoalProps, ITask };
export default TaskGoal;

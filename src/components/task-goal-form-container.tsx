import {
    addTaskGoal,
    addTaskGoalQuery,
    IAddTaskGoalFragment,
    IAddTaskGoalResponse,
} from "actions/add-task-goal-action";
import {
    editTask,
    editTaskQuery,
    IEditTaskResponse,
} from "actions/edit-task-action";
import {
    editTaskGoal,
    editTaskGoalQuery,
    IEditTaskGoalFragment,
    IEditTaskGoalResponse,
} from "actions/edit-task-goal-action";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { HeaderTitle, IHeaderState } from "components/header";
import TaskGoalForm, { ITask } from "components/task-goal-form";
import { debounce, throttle } from "lodash";
import ProgressDisplayMode from "models/progress-display-mode";
import Type from "models/type";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { withApollo } from "react-apollo/withApollo";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";
import Difficulty from "utils/difficulty";
import uuid from "utils/uuid";

interface ITaskGoal {
    id: string;
    title: string;
    iconName: string;
    isPublic: boolean;
    difficulty: Difficulty;
    tasks: ITask[];
    progressDisplayMode: ProgressDisplayMode;
    deadlineDate?: number;
}

type ITaskGoalFormContainerProps = RouteComponentProps<{}> & {
    trackable?: ITaskGoal;
    isUserLoggedIn: boolean;
    onAddTaskGoal: (goal: IAddTaskGoalFragment) => Promise<void>;
    onEditTaskGoal: (goal: IEditTaskGoalFragment) => void;
    onEditTask: (id: string, title: string) => void;
};

interface ITaskGoalFormContainerState {
    title?: string;
    titleError?: string|null;
    iconName: string;
    isPublic: boolean;
    difficulty: Difficulty;
    tasks: ITask[];
    taskListError?: string|null;
    taskErrors: { [id: string]: string|null|undefined };
    deadlineDate?: Date;
    progressDisplayMode: ProgressDisplayMode;
    isExpanded?: boolean;
    newTaskTitle?: string;
    isIconPickerOpen?: boolean;
    focusedTaskId?: string;
}

type IOwnProps = RouteComponentProps<{}> & {
    client: ApolloClient<NormalizedCacheObject>;
};

const withAddGoal =
    graphql<IAddTaskGoalResponse, IOwnProps, ITaskGoalFormContainerProps>(
        addTaskGoalQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onAddTaskGoal: (goal: IAddTaskGoalFragment) => {
                        addTaskGoal(goal, mutate!, ownProps.client);
                    },
                };
            },
        },
    );

const withEditGoal =
    graphql<IEditTaskGoalResponse, IOwnProps, ITaskGoalFormContainerProps>(
        editTaskGoalQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onEditTaskGoal: (goal: IEditTaskGoalFragment) => {
                        editTaskGoal(goal, mutate!, ownProps.client);
                    },
                };
            },
        },
    );

const withEditTask =
    graphql<IEditTaskResponse, IOwnProps, ITaskGoalFormContainerProps>(
        editTaskQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onEditTask: (id: string, title: string) => {
                        editTask(id, title, mutate!, ownProps.client);
                    },
                };
            },
        },
    );

const icons = [
    "access-point", "access-point-network", "account", "account-alert",
    "account-box", "account-box-outline", "account-card-details",
    "account-check", "account-circle", "account-convert", "account-edit",
    "account-key", "account-location", "account-minus", "account-multiple",
    "account-multiple-minus",
];

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

const saveDelay = 512;

class TaskGoalFormContainer extends
    React.Component<ITaskGoalFormContainerProps, ITaskGoalFormContainerState> {
    public state: ITaskGoalFormContainerState = {
        difficulty: Difficulty.Easy,
        iconName: "access-point",
        isPublic: false,
        progressDisplayMode: ProgressDisplayMode.Percentage,
        taskErrors: {},
        tasks: [],
    };
    private minDeadlineDate: Date;

    public constructor(props: ITaskGoalFormContainerProps, context: any) {
        super(props, context);
        this.onChangeDifficulty = throttle(this.onChangeDifficulty, 256);
        this.saveDifficulty = debounce(this.saveDifficulty, saveDelay);
        this.saveTitle = debounce(this.saveTitle, saveDelay);
        this.saveTaskTitle = debounce(this.saveTaskTitle, saveDelay);
        this.saveTask = debounce(this.saveTask, saveDelay);
        this.minDeadlineDate = new Date();
        this.minDeadlineDate.setDate(this.minDeadlineDate.getDate() + 1);
    }

    public render() {
        const {
            title,
            titleError,
            iconName,
            isPublic,
            difficulty,
            tasks,
            taskListError,
            taskErrors,
            deadlineDate,
            progressDisplayMode,
            isExpanded,
            newTaskTitle,
            isIconPickerOpen,
            focusedTaskId,
        } = this.state;
        const isNew = this.isNew();
        return (
            <TaskGoalForm
                isValid={this.isValid(this.state)}
                title={title!}
                titleError={titleError}
                availableIconNames={icons}
                iconName={iconName!}
                isPublic={isPublic!}
                isPublicDisabled={!isNew || !this.props.isUserLoggedIn}
                difficulty={difficulty!}
                tasks={tasks!}
                taskListError={taskListError}
                taskErrors={taskErrors}
                focusedTaskId={focusedTaskId}
                isExpanded={isExpanded!}
                deadlineDate={deadlineDate}
                minDeadlineDate={this.minDeadlineDate}
                progressDisplayMode={progressDisplayMode!}
                newTaskTitle={newTaskTitle}
                isAddTaskDisabled={!isNew}
                isRemoveTaskDisabled={!isNew}
                isIconPickerOpen={isIconPickerOpen}
                onChangeExpanded={this.onChangeExpanded}
                onChangeTitle={this.onChangeTitle}
                onOpenIconPicker={this.onToggleIconPicker}
                onChangeIcon={this.onChangeIcon}
                onChangePublic={this.onChangePublic}
                onChangeDifficulty={this.onChangeDifficulty}
                onChangeDeadlineDate={this.onChangeDeadlineDate}
                onChangeProgressDisplayMode={this.onChangeProgressDisplayMode}
                onRemoveTask={this.onRemoveTask}
                onChangeTaskTitle={this.onChangeTaskTitle}
                onChangeNewTaskTitle={this.onChangeNewTaskTitle}
                onFocusTask={this.onFocusTask}
                onDifficultyToNumber={this.onDifficultyToNumber}
                onNumberToDifficulty={this.onNumberToDifficulty}
                onGetDifficultyTitleMsgId={this.onGetDifficultyTitleMsgId}
            />
        );
    }

    public componentWillMount() {
        this.updateHeader(this.isValid(this.state));

        if (this.isNew()) {
            this.setState({ isPublic: this.props.isUserLoggedIn });
            return;
        }

        const {
            deadlineDate,
            difficulty,
            iconName,
            isPublic,
            progressDisplayMode,
            tasks,
            title,
        } = this.props.trackable!;
        this.setState({
            deadlineDate: deadlineDate ? new Date(deadlineDate) : undefined,
            difficulty,
            iconName,
            isPublic,
            progressDisplayMode,
            tasks,
            title,
        });
    }

    public componentWillUpdate(
        nextProps: ITaskGoalFormContainerProps,
        nextState: ITaskGoalFormContainerState,
    ) {
        const nextIsValid = this.isValid(nextState);

        if (this.isValid(this.state) !== nextIsValid) {
            this.updateHeader(nextIsValid);
        }
    }

    private isValid(state: ITaskGoalFormContainerState) {
        if (this.isNew()) {
            if (state.titleError !== null || state.taskListError !== null) {
                return false;
            }

            for (const taskId in state.taskErrors) {
                if (state.taskErrors[taskId] !== null) {
                    return false;
                }
            }

            return true;
        }

        if (state.titleError || state.taskListError) {
            return false;
        }

        for (const taskId in state.taskErrors) {
            if (state.taskErrors[taskId]) {
                return false;
            }
        }

        return true;
    }

    private isNew() {
        return !this.props.trackable;
    }

    private updateHeader(isValid: boolean) {
        const title = (
            <HeaderTitle>
                <FormattedMessage id="trackableTypes.taskGoal" />
            </HeaderTitle>
        );
        this.props.history.replace({
            ...this.props.location,
            state: {
                hideBackCommand: !this.isNew(),
                rightCommands: [
                    {
                        isDisabled: !isValid,
                        msgId: "common.done",
                        onRun: this.onDone,
                    },
                ],
                title,
            } as IHeaderState,
        });
    }

    private pushHeader(state: IHeaderState) {
        this.props.history.push({
            ...this.props.location,
            state,
        });
    }

    private popHeader() {
        this.props.history.goBack();
    }

    private onDone = async () => {
        if (this.isNew()) {
            try {
                await this.saveTaskGoal();
            } catch (e) {
                // TODO
                throw e;
            }
        }

        this.props.history.goBack();
    }

    private saveTaskGoal() {
        const {
            title,
            iconName,
            isPublic,
            difficulty,
            tasks,
            deadlineDate,
            progressDisplayMode,
        } = this.state;
        return this.props.onAddTaskGoal({
            deadlineDate: deadlineDate && deadlineDate.getTime(),
            difficulty,
            iconName,
            isPublic,
            progressDisplayMode,
            tasks: tasks.map((task) => {
                return { title: task.title };
            }),
            title: title!,
        });
    }

    private onChangeExpanded = (isExpanded: boolean) => {
        this.setState({ isExpanded });
    }

    private onChangeDifficulty = (difficulty: Difficulty) => {
        this.setState({ difficulty });
        this.saveDifficulty(difficulty);
    }

    private saveDifficulty = (difficulty: Difficulty) => {
        if (this.isNew()) {
            return;
        }

        this.props.onEditTaskGoal({ difficulty, id: this.props.trackable!.id });
    }

    private onChangeTitle = (title: string) => {
        this.setState({ title });
        this.saveTitle(title);
    }

    private saveTitle = (title: string) => {
        const titleError = !title ? "errors.emptyValue" : null;
        this.setState({ titleError });

        if (titleError || this.isNew()) {
            return;
        }

        this.props.onEditTaskGoal({ id: this.props.trackable!.id, title });
    }

    private onChangeNewTaskTitle = (title: string) => {
        this.setState({ newTaskTitle: title });

        if (title) {
            this.saveTask(title);
        }
    }

    private saveTask = (title: string) => {
        this.setState((prevState) => {
            const id = uuid();
            const task = { id, title, isDone: false };
            return {
                focusedTaskId: id,
                newTaskTitle: undefined,
                taskListError: null,
                tasks: prevState.tasks.concat([task]),
            };
        });
    }

    private onChangeTaskTitle = (id: string, title: string) => {
        this.setState((prevState) => {
            const tasks = prevState.tasks.map((task) => {
                if (id === task.id) {
                    return { ...task, title };
                }

                return task;
            });
            this.saveTaskTitle(id, title);
            return { tasks };
        });
    }

    private saveTaskTitle = (id: string, title: string) => {
        this.setState((prevState) => {
            const error = !title ? "errors.emptyValue" : null;
            const taskErrors = { ...prevState.taskErrors, [id]: error };

            if (!error && !this.isNew()) {
                this.props.onEditTask(id, title);
            }

            return { taskErrors };
        });
    }

    private onRemoveTask = (id: string) => {
        this.setState((prevState) => {
            let focusedTaskId;
            const tasks = prevState.tasks.filter((task, i) => {
                if (task.id !== id) {
                    return true;
                }

                focusedTaskId = undefined;
                return false;
            });
            const taskListError = !tasks.length ? "errors.noTasks" : null;
            const taskErrors = { ...prevState.taskErrors, [id]: null };
            return { tasks, taskListError, taskErrors, focusedTaskId };
        });
    }

    private onChangeIcon = (iconName: string) => {
        this.setState({ iconName, isIconPickerOpen: false });
        this.popHeader();

        if (this.isNew()) {
            return;
        }

        this.props.onEditTaskGoal({ id: this.props.trackable!.id, iconName });
    }

    private onToggleIconPicker = () => {
        this.setState((prevState) => {
            const isIconPickerOpen = !prevState.isIconPickerOpen;

            if (isIconPickerOpen) {
                const title = (
                    <HeaderTitle>
                        <FormattedMessage id="trackableForm.iconLabel" />
                    </HeaderTitle>
                );
                this.pushHeader({
                    onBack: this.onCloseIconPicker,
                    rightCommands: [],
                    title,
                });
            }

            return { isIconPickerOpen };
        });
    }

    private onCloseIconPicker = () => {
        this.popHeader();
        this.onToggleIconPicker();
    }

    private onChangePublic = (isPublic: boolean) => {
        this.setState({ isPublic });
    }

    private onChangeDeadlineDate = (deadlineDate?: Date) => {
        this.setState({ deadlineDate });

        if (this.isNew()) {
            return;
        }

        this.props.onEditTaskGoal({
            deadlineDate: deadlineDate ? deadlineDate.getTime() : null,
            id: this.props.trackable!.id,
        });
    }

    private onChangeProgressDisplayMode = (
        progressDisplayMode: ProgressDisplayMode,
    ) => {
        this.setState({ progressDisplayMode });

        if (this.isNew()) {
            return;
        }

        this.props.onEditTaskGoal(
            { id: this.props.trackable!.id, progressDisplayMode });
    }

    private onFocusTask = (focusedTaskId?: string) => {
        this.setState({ focusedTaskId });
    }

    private onDifficultyToNumber = (difficulty: Difficulty) => {
        return difficultyToNumber[difficulty];
    }

    private onNumberToDifficulty = (difficulty: number) => {
        return numberToDifficulty[Math.round(difficulty)];
    }

    private onGetDifficultyTitleMsgId = (difficulty: Difficulty) => {
        return difficultyToMsgId[difficulty];
    }
}

export { ITaskGoal };
export default compose(
    withRouter,
    withApollo,
    withAddGoal,
    withEditGoal,
    withEditTask,
)(TaskGoalFormContainer);

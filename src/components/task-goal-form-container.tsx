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
import GoalFormContainer, {
    IGoal,
    IGoalFormContainerProps,
    IGoalFormContainerState,
} from "components/goal-form-container";
import { IHeaderState } from "components/header";
import TaskGoalForm, { ITask } from "components/task-goal-form";
import withHeader from "components/with-header";
import { debounce, throttle } from "lodash";
import Difficulty from "models/difficulty";
import ProgressDisplayMode from "models/progress-display-mode";
import Type from "models/type";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { withApollo } from "react-apollo/withApollo";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";
import IconName from "utils/icon-name";
import { push } from "utils/immutable-utils";
import uuid from "utils/uuid";

interface ITaskGoal extends IGoal {
    tasks: ITask[];
}

type ITaskGoalFormContainerProps = IGoalFormContainerProps<ITaskGoal> & {
    onAddGoal: (goal: IAddTaskGoalFragment) => Promise<void>;
    onEditGoal: (goal: IEditTaskGoalFragment) => Promise<void>;
    onEditTask: (id: string, title: string) => Promise<void>;
};

interface ITaskGoalFormContainerState extends IGoalFormContainerState {
    tasks: ITask[];
    taskListError?: string|null;
    taskErrors: { [id: string]: string|null|undefined };
    newTaskTitle?: string;
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
                    onAddGoal: (goal: IAddTaskGoalFragment) =>
                        addTaskGoal(goal, mutate!, ownProps.client),
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
                    onEditGoal: (goal: IEditTaskGoalFragment) =>
                        editTaskGoal(goal, mutate!, ownProps.client),
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
                    onEditTask: (id: string, title: string) =>
                        editTask(id, title, mutate!, ownProps.client),
                };
            },
        },
    );

class TaskGoalFormContainer extends GoalFormContainer<
    ITaskGoal,
    IEditTaskGoalFragment,
    ITaskGoalFormContainerProps,
    ITaskGoalFormContainerState
> {
    public constructor(props: ITaskGoalFormContainerProps, context: any) {
        super(props, context);
        this.saveTaskTitle = debounce(this.saveTaskTitle, this.saveDelay);
        this.addTask = debounce(this.addTask, this.saveDelay);
        Object.assign(this.state, {
            taskErrors: {},
            tasks: [],
        });
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
        const isPublicDisabled = this.isPublicDisabled(
            isNew, this.props.isUserLoggedIn);
        return (
            <TaskGoalForm
                title={title!}
                titleError={titleError}
                availableIconNames={this.icons}
                iconName={iconName!}
                isPublic={isPublic!}
                isPublicDisabled={isPublicDisabled}
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

    protected getTitleMsgId() {
        return "trackableTypes.taskGoal";
    }

    protected doEditTrackable(trackable: IEditTaskGoalFragment) {
        return this.props.onEditGoal(trackable);
    }

    protected addTrackable() {
        const {
            title,
            iconName,
            isPublic,
            difficulty,
            tasks,
            deadlineDate,
            progressDisplayMode,
        } = this.state;
        return this.props.onAddGoal({
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

    protected isValidForAdd(state: ITaskGoalFormContainerState) {
        if (state.taskListError !== null) {
            return false;
        }

        for (const taskId in state.taskErrors) {
            if (state.taskErrors[taskId] !== null) {
                return false;
            }
        }

        return true;
    }

    protected isValidForEdit(state: ITaskGoalFormContainerState) {
        if (state.taskListError) {
            return false;
        }

        for (const taskId in state.taskErrors) {
            if (state.taskErrors[taskId]) {
                return false;
            }
        }

        return true;
    }

    protected getInitialStateForAdd() {
        return {
            iconName: IconName.TaskGoal as string,
        } as ITaskGoalFormContainerState;
    }

    protected getInitialStateForEdit() {
        const {
            deadlineDate,
            difficulty,
            progressDisplayMode,
            tasks,
        } = this.props.trackable!;
        return {
            deadlineDate: deadlineDate ? new Date(deadlineDate) : undefined,
            difficulty,
            progressDisplayMode,
            tasks,
        } as ITaskGoalFormContainerState;
    }

    private onChangeNewTaskTitle = (title: string) => {
        this.setState({ newTaskTitle: title });

        if (title) {
            this.addTask(title);
        }
    }

    private addTask = (title: string) => {
        this.setState((prevState) => {
            const id = uuid();
            const task = { id, title, isDone: false };
            return {
                focusedTaskId: id,
                newTaskTitle: undefined,
                taskListError: null,
                tasks: push(task, prevState.tasks),
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
            return { tasks };
        });
        this.saveTaskTitle(id, title);
    }

    private saveTaskTitle = (id: string, title: string) => {
        let error: string|null;

        this.setState((prevState) => {
            error = !title ? "errors.emptyValue" : null;
            const taskErrors = { ...prevState.taskErrors, [id]: error };
            return { taskErrors };
        }, () => {
            if (!error && !this.isNew()) {
                this.transaction(() => this.props.onEditTask(id, title));
            }
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

    private onFocusTask = (focusedTaskId?: string) =>
        this.setState({ focusedTaskId })
}

export { ITaskGoal };
export default compose(
    withRouter,
    withApollo,
    withAddGoal,
    withEditGoal,
    withEditTask,
    withHeader,
)(TaskGoalFormContainer);

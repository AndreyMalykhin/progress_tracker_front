import Button, { ButtonIcon, ButtonTitle } from "components/button";
import {
    FormBody,
    FormError,
    FormGroup,
    FormLabel,
    FormSection,
} from "components/form";
import FormDateInput from "components/form-date-input";
import {
    FormIconPickerCollapsed,
    FormIconPickerExpanded,
} from "components/form-icon-picker";
import FormSlider from "components/form-slider";
import FormSwitch from "components/form-switch";
import FormTextInput from "components/form-text-input";
import TextInput from "components/text-input";
import ProgressDisplayMode from "models/progress-display-mode";
import Type from "models/type";
import * as React from "react";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import {
    StyleSheet,
    Text,
    TextInput as NativeTextInput,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Difficulty from "utils/difficulty";

interface ITask {
    id: string;
    title: string;
    isDone: boolean;
}

type ITaskListProps = InjectedIntlProps & {
    items: ITask[];
    newItemTitle?: string;
    isAddDisabled: boolean;
    isRemoveDisabled: boolean;
    focusedItemId?: string;
    errors: { [id: string]: string|null|undefined };
    onRemoveItem: (id: string) => void;
    onChangeItemTitle: (id: string, title: string) => void;
    onChangeNewItemTitle: (title: string) => void;
    onFocusItem: (id?: string) => void;
};

interface ITaskListItemProps {
    id?: string;
    title?: string;
    placeholder?: string;
    isFocused?: boolean;
    errorMsgId?: string|null;
    onChangeTitle: (id: string, title: string) => void;
    onRemove?: (id: string) => void;
    onFocus: (id?: string) => void;
}

interface ITaskGoalFormProps {
    title: string;
    titleError?: string|null;
    iconName: string;
    availableIconNames: string[];
    isPublic: boolean;
    isPublicDisabled: boolean;
    difficulty: Difficulty;
    tasks: ITask[];
    taskListError?: string|null;
    taskErrors: { [id: string]: string|null|undefined };
    deadlineDate?: Date;
    minDeadlineDate: Date;
    progressDisplayMode: ProgressDisplayMode;
    isValid: boolean;
    isExpanded: boolean;
    newTaskTitle?: string;
    isAddTaskDisabled: boolean;
    isRemoveTaskDisabled: boolean;
    isIconPickerOpen?: boolean;
    focusedTaskId?: string;
    onOpenIconPicker: () => void;
    onChangeTitle: (value: string) => void;
    onChangeDifficulty: (value: Difficulty) => void;
    onChangePublic: (value: boolean) => void;
    onChangeExpanded: (value: boolean) => void;
    onChangeIcon: (name: string) => void;
    onChangeDeadlineDate: (value?: Date) => void;
    onChangeProgressDisplayMode: (value: ProgressDisplayMode) => void;
    onRemoveTask: (id: string) => void;
    onChangeTaskTitle: (id: string, title: string) => void;
    onChangeNewTaskTitle: (title: string) => void;
    onFocusTask: (id?: string) => void;
    onNumberToDifficulty: (difficulty: number) => Difficulty;
    onDifficultyToNumber: (difficulty: Difficulty) => number;
    onGetDifficultyTitleMsgId: (difficulty: Difficulty) => string;
}

class TaskGoalForm extends
    React.Component<ITaskGoalFormProps & InjectedIntlProps> {
    public render() {
        const {
            isIconPickerOpen,
            title,
            titleError,
            iconName,
            isPublic,
            isPublicDisabled,
            isExpanded,
            isAddTaskDisabled,
            isRemoveTaskDisabled,
            tasks,
            taskListError,
            taskErrors,
            newTaskTitle,
            difficulty,
            intl,
            focusedTaskId,
            availableIconNames,
            onChangeExpanded,
            onChangeTitle,
            onChangeIcon,
            onOpenIconPicker,
            onChangePublic,
            onRemoveTask,
            onChangeTaskTitle,
            onChangeNewTaskTitle,
            onFocusTask,
            onDifficultyToNumber,
        } = this.props;

        if (isIconPickerOpen) {
            return (
                <FormIconPickerExpanded
                    availableIconNames={availableIconNames}
                    iconName={iconName}
                    onSelect={onChangeIcon}
                />
            );
        }

        return (
            <FormBody>
                <FormTextInput
                    labelMsgId="trackableForm.titleLabel"
                    placeholderMsgId="trackableForm.titlePlaceholder"
                    value={title}
                    errorMsgId={titleError}
                    onChangeText={onChangeTitle}
                />
                <FormIconPickerCollapsed
                    iconName={iconName}
                    onExpand={onOpenIconPicker}
                />
                <FormSwitch
                    labelMsgId="trackableForm.isPublicLabel"
                    hintMsgId="trackableForm.isPublicHint"
                    disabled={isPublicDisabled}
                    value={isPublic}
                    onValueChange={onChangePublic}
                />
                <FormSlider
                    labelMsgId="trackableForm.difficultyLabel"
                    value={onDifficultyToNumber(difficulty)}
                    minimumValue={0}
                    maximumValue={3}
                    step={1}
                    onValueChange={this.onChangeDifficulty}
                    onRenderValueFeedback={this.onRenderDifficultyTitle}
                />
                <FormGroup
                    labelMsgId="taskGoalForm.tasksLabel"
                    errorMsgId={taskListError}
                >
                    <TaskList
                        intl={intl}
                        items={tasks}
                        newItemTitle={newTaskTitle}
                        isAddDisabled={isAddTaskDisabled}
                        isRemoveDisabled={isRemoveTaskDisabled}
                        focusedItemId={focusedTaskId}
                        errors={taskErrors}
                        onRemoveItem={onRemoveTask}
                        onChangeItemTitle={onChangeTaskTitle}
                        onChangeNewItemTitle={onChangeNewTaskTitle}
                        onFocusItem={onFocusTask}
                    />
                </FormGroup>
                <FormSection
                    msgId="trackableForm.advancedSection"
                    isExpanded={isExpanded}
                    onChangeExpanded={onChangeExpanded}
                    onRenderChildren={this.onRenderAdvancedControls}
                />
            </FormBody>
        );
    }

    private onChangeDifficulty = (value: number) => {
        this.props.onChangeDifficulty(this.props.onNumberToDifficulty(value));
    }

    private onChangeProgressDisplayMode = (isValue: boolean) => {
        this.props.onChangeProgressDisplayMode(isValue ?
            ProgressDisplayMode.Value : ProgressDisplayMode.Percentage);
    }

    private onRenderDifficultyTitle = () => {
        const msgId =
            this.props.onGetDifficultyTitleMsgId(this.props.difficulty);
        return (
            <Text style={styles.difficultyTitle}>
                <FormattedMessage id={msgId} />
            </Text>
        );
    }

    private onRenderAdvancedControls = () => {
        const {
            deadlineDate,
            minDeadlineDate,
            progressDisplayMode,
            onChangeDeadlineDate,
        } = this.props;
        return (
            <View>
                <FormDateInput
                    labelMsgId="trackableForm.deadlineDateLabel"
                    placeholderMsgId="trackableForm.deadlineDatePlaceholder"
                    value={deadlineDate}
                    minValue={minDeadlineDate}
                    onValueChange={onChangeDeadlineDate}
                />
                <FormSwitch
                    labelMsgId="trackableForm.progressDisplayModeLabel"
                    value={progressDisplayMode === ProgressDisplayMode.Value}
                    onValueChange={this.onChangeProgressDisplayMode}
                />
            </View>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class TaskList extends React.PureComponent<ITaskListProps> {
    public render() {
        const {
            items,
            intl,
            focusedItemId,
            isAddDisabled,
            isRemoveDisabled,
            errors,
            onChangeItemTitle,
            onChangeNewItemTitle,
            onRemoveItem,
            onFocusItem,
        } = this.props;
        const itemElements = items.map((item, i) => {
            const itemId = item.id;
            return (
                <TaskListItem
                    key={i}
                    id={itemId}
                    title={item.title}
                    isFocused={focusedItemId === itemId}
                    errorMsgId={errors[itemId]}
                    onChangeTitle={onChangeItemTitle}
                    onRemove={isRemoveDisabled ? undefined : onRemoveItem}
                    onFocus={onFocusItem}
                />
            );
        });

        if (!isAddDisabled) {
            const placeholder = intl.formatMessage(
                { id: "taskGoalForm.newTaskTitlePlaceholder" });
            itemElements.push(
                <TaskListItem
                    key={itemElements.length}
                    isFocused={!focusedItemId}
                    placeholder={placeholder}
                    onChangeTitle={this.onChangeNewItemTitle}
                    onFocus={onFocusItem}
                />,
            );
        }

        return <View>{itemElements}</View>;
    }

    private onChangeNewItemTitle = (id: string, title: string) => {
        this.props.onChangeNewItemTitle(title);
    }
}

// tslint:disable-next-line:max-classes-per-file
class TaskListItem extends React.PureComponent<ITaskListItemProps> {
    private input?: NativeTextInput;

    public render() {
        const {
            id,
            title,
            placeholder,
            isFocused,
            errorMsgId,
            onChangeTitle,
            onRemove,
        } = this.props;
        const inputStyle = [
            styles.taskListItem,
            id ? styles.taskListItemNew : null,
            isFocused ? styles.taskListItemFocused : null,
        ];
        return (
            <View>
                <TextInput
                    onRef={this.onInputRef as any}
                    containerStyle={inputStyle}
                    value={title}
                    placeholder={placeholder}
                    clearable={isFocused && onRemove != null}
                    invalid={errorMsgId != null}
                    onClear={this.onRemove}
                    onChangeText={this.onChangeTitle}
                    onFocus={this.onFocus}
                />
                {errorMsgId && <FormError msgId={errorMsgId} />}
            </View>
        );
    }

    public componentDidUpdate(prevProps: ITaskListItemProps) {
        const { isFocused } = this.props;

        if (isFocused !== prevProps.isFocused && isFocused) {
            requestAnimationFrame(() => this.input && this.input.focus());
        }
    }

    private onInputRef = (ref?: NativeTextInput) => this.input = ref;

    private onRemove = () => {
        this.props.onRemove!(this.props.id!);
    }

    private onChangeTitle = (title: string) => {
        this.props.onChangeTitle(this.props.id!, title);
    }

    private onFocus = () => {
        this.props.onFocus(this.props.id);
    }
}

const styles = StyleSheet.create({
    difficultyTitle: {
        flexBasis: 96,
        textAlign: "center",
    },
    taskListItem: {
        borderColor: "transparent",
    },
    taskListItemFocused: {
        borderColor: "#000",
    },
    taskListItemNew: {},
});

export { ITask };
export default injectIntl(TaskGoalForm);

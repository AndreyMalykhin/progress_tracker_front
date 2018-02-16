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
import TrackableForm, { ITrackableFormProps } from "components/trackable-form";
import Difficulty from "models/difficulty";
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

interface IGoalFormProps extends ITrackableFormProps {
    difficulty: Difficulty;
    deadlineDate?: Date;
    minDeadlineDate: Date;
    progressDisplayMode: ProgressDisplayMode;
    isExpanded: boolean;
    onChangeDifficulty: (value: Difficulty) => void;
    onChangeExpanded: (value: boolean) => void;
    onChangeDeadlineDate: (value?: Date) => void;
    onChangeProgressDisplayMode: (value: ProgressDisplayMode) => void;
    onNumberToDifficulty: (difficulty: number) => Difficulty;
    onDifficultyToNumber: (difficulty: Difficulty) => number;
    onGetDifficultyTitleMsgId: (difficulty: Difficulty) => string;
    onRenderChildren: () => JSX.Element;
}

class GoalForm extends
    React.Component<IGoalFormProps & InjectedIntlProps> {
    public render() {
        const { onRenderChildren, ...restProps } = this.props;
        return (
            <TrackableForm
                onRenderChildren={this.onRenderChildren}
                {...restProps}
            />
        );
    }

    private onRenderChildren = () => {
        const {
            isExpanded,
            difficulty,
            intl,
            onChangeExpanded,
            onDifficultyToNumber,
            onRenderChildren,
        } = this.props;
        return (
            <View>
                <FormSlider
                    labelMsgId="trackableForm.difficultyLabel"
                    value={onDifficultyToNumber(difficulty)}
                    minimumValue={0}
                    maximumValue={3}
                    step={1}
                    onValueChange={this.onChangeDifficulty}
                    onRenderValueFeedback={this.onRenderDifficultyTitle}
                />
                {onRenderChildren()}
                <FormSection
                    msgId="trackableForm.advancedSection"
                    isExpanded={isExpanded}
                    onChangeExpanded={onChangeExpanded}
                    onRenderChildren={this.onRenderAdvancedControls}
                />
            </View>
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

const styles = StyleSheet.create({
    difficultyTitle: {
        flexBasis: 96,
        textAlign: "center",
    },
});

export { IGoalFormProps };
export default injectIntl(GoalForm);

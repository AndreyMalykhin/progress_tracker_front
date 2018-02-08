import {
    addNumericalGoal,
    addNumericalGoalQuery,
    IAddNumericalGoalFragment,
    IAddNumericalGoalResponse,
} from "actions/add-numerical-goal-action";
import {
    editNumericalGoal,
    editNumericalGoalQuery,
    IEditNumericalGoalFragment,
    IEditNumericalGoalResponse,
} from "actions/edit-numerical-goal-action";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import GoalFormContainer, {
    IGoal,
    IGoalFormContainerProps,
    IGoalFormContainerState,
} from "components/goal-form-container";
import { IHeaderState } from "components/header";
import NumericalGoalForm from "components/numerical-goal-form";
import withHeader from "components/with-header";
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

interface INumericalGoal extends IGoal {
    maxProgress?: number;
}

type INumericalGoalFormContainerProps =
    IGoalFormContainerProps<INumericalGoal> & {
    onAddGoal: (goal: IAddNumericalGoalFragment) => Promise<void>;
    onEditGoal: (goal: IEditNumericalGoalFragment) => void;
};

interface INumericalGoalFormContainerState extends IGoalFormContainerState {
    maxProgress?: string;
    maxProgressError?: string|null;
}

type IOwnProps = RouteComponentProps<{}> & {
    client: ApolloClient<NormalizedCacheObject>;
};

const withAddGoal = graphql<
    IAddNumericalGoalResponse,
    IOwnProps,
    INumericalGoalFormContainerProps
>(
    addNumericalGoalQuery,
    {
        props: ({ ownProps, mutate }) => {
            return {
                onAddGoal: (goal: IAddNumericalGoalFragment) => {
                    addNumericalGoal(goal, mutate!, ownProps.client);
                },
            };
        },
    },
);

const withEditGoal = graphql<
    IEditNumericalGoalResponse,
    IOwnProps,
    INumericalGoalFormContainerProps
>(
    editNumericalGoalQuery,
    {
        props: ({ ownProps, mutate }) => {
            return {
                onEditGoal: (goal: IEditNumericalGoalFragment) => {
                    editNumericalGoal(goal, mutate!, ownProps.client);
                },
            };
        },
    },
);

class NumericalGoalFormContainer extends GoalFormContainer<
    INumericalGoal,
    INumericalGoalFormContainerProps,
    INumericalGoalFormContainerState
> {
    public constructor(props: INumericalGoalFormContainerProps, context: any) {
        super(props, context);
        this.validateMaxProgress = debounce(this.validateMaxProgress, this.saveDelay);
    }

    public render() {
        const {
            title,
            titleError,
            iconName,
            isPublic,
            difficulty,
            deadlineDate,
            progressDisplayMode,
            isExpanded,
            isIconPickerOpen,
            maxProgress,
            maxProgressError,
        } = this.state;
        const isNew = this.isNew();
        const isPublicDisabled = this.isPublicDisabled(
            isNew, this.props.isUserLoggedIn);
        return (
            <NumericalGoalForm
                maxProgress={maxProgress}
                maxProgressError={maxProgressError}
                isMaxProgressDisabled={!isNew}
                title={title!}
                titleError={titleError}
                availableIconNames={this.icons}
                iconName={iconName!}
                isPublic={isPublic!}
                isPublicDisabled={isPublicDisabled}
                difficulty={difficulty!}
                isExpanded={isExpanded!}
                deadlineDate={deadlineDate}
                minDeadlineDate={this.minDeadlineDate}
                progressDisplayMode={progressDisplayMode!}
                isIconPickerOpen={isIconPickerOpen}
                onChangeExpanded={this.onChangeExpanded}
                onChangeTitle={this.onChangeTitle}
                onOpenIconPicker={this.onToggleIconPicker}
                onChangeIcon={this.onChangeIcon}
                onChangePublic={this.onChangePublic}
                onChangeDifficulty={this.onChangeDifficulty}
                onChangeDeadlineDate={this.onChangeDeadlineDate}
                onChangeProgressDisplayMode={this.onChangeProgressDisplayMode}
                onChangeMaxProgress={this.onChangeMaxProgress}
                onDifficultyToNumber={this.onDifficultyToNumber}
                onNumberToDifficulty={this.onNumberToDifficulty}
                onGetDifficultyTitleMsgId={this.onGetDifficultyTitleMsgId}
            />
        );
    }

    protected getTitleMsgId() {
        return "trackableTypes.numericalGoal";
    }

    protected addTrackable() {
        const {
            title,
            iconName,
            isPublic,
            difficulty,
            deadlineDate,
            progressDisplayMode,
            maxProgress,
        } = this.state;
        return this.props.onAddGoal({
            deadlineDate: deadlineDate && deadlineDate.getTime(),
            difficulty,
            iconName,
            isPublic,
            maxProgress: Number(maxProgress!),
            progressDisplayMode,
            title: title!,
        });
    }

    protected saveTitle(title: string) {
        this.props.onEditGoal({ id: this.props.trackable!.id, title });
    }

    protected saveIconName(iconName: string) {
        this.props.onEditGoal({ id: this.props.trackable!.id, iconName });
    }

    protected isValidForAdd(state: INumericalGoalFormContainerState) {
        return state.maxProgressError === null;
    }

    protected isValidForEdit(state: INumericalGoalFormContainerState) {
        return !state.maxProgressError;
    }

    protected getInitialStateForAdd() {
        return {
            iconName: "access-point",
        } as INumericalGoalFormContainerState;
    }

    protected getInitialStateForEdit() {
        const {
            deadlineDate,
            difficulty,
            progressDisplayMode,
            maxProgress,
        } = this.props.trackable!;
        return {
            deadlineDate: deadlineDate ? new Date(deadlineDate) : undefined,
            difficulty,
            maxProgress: String(maxProgress),
            progressDisplayMode,
        } as INumericalGoalFormContainerState;
    }

    protected saveDifficulty(difficulty: Difficulty) {
        this.props.onEditGoal({ difficulty, id: this.props.trackable!.id });
    }

    protected saveDeadlineDate(deadlineDate: number|null) {
        this.props.onEditGoal(
            { deadlineDate, id: this.props.trackable!.id });
    }

    protected saveProgressDisplayMode(
        progressDisplayMode: ProgressDisplayMode,
    ) {
        this.props.onEditGoal(
            { id: this.props.trackable!.id, progressDisplayMode });
    }

    private onChangeMaxProgress = (maxProgress: string) => {
        this.setState({ maxProgress });
        this.validateMaxProgress(maxProgress);
    }

    private validateMaxProgress = (value: string) => {
        const maxProgress = parseFloat(value);
        const maxProgressError = isNaN(maxProgress) || maxProgress <= 0 ?
            "errors.negativeOrNotNumber" : null;
        this.setState({ maxProgressError });
    }
}

export { INumericalGoal };
export default compose(
    withRouter,
    withApollo,
    withAddGoal,
    withEditGoal,
    withHeader,
)(NumericalGoalFormContainer);

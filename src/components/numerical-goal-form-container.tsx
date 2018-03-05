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
import withDIContainer from "components/with-di-container";
import withHeader from "components/with-header";
import withNetworkStatus from "components/with-network-status";
import { debounce, throttle } from "lodash";
import Difficulty from "models/difficulty";
import ProgressDisplayMode from "models/progress-display-mode";
import TrackableType from "models/trackable-type";
import Type from "models/type";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { withApollo } from "react-apollo/withApollo";
import { FormattedMessage, injectIntl } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";
import IconName from "utils/icon-name";
import uuid from "utils/uuid";

interface INumericalGoal extends IGoal {
    maxProgress?: number;
}

type INumericalGoalFormContainerProps =
    IGoalFormContainerProps<INumericalGoal> & {
    onAddGoal: (goal: IAddNumericalGoalFragment) => Promise<any>;
    onEditGoal: (goal: IEditNumericalGoalFragment) => Promise<any>;
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
                onAddGoal: (goal: IAddNumericalGoalFragment) =>
                    addNumericalGoal(goal, mutate!, ownProps.client),
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
                onEditGoal: (goal: IEditNumericalGoalFragment) =>
                    editNumericalGoal(goal, mutate!, ownProps.client),
            };
        },
    },
);

class NumericalGoalFormContainer extends GoalFormContainer<
    INumericalGoal,
    IEditNumericalGoalFragment,
    INumericalGoalFormContainerProps,
    INumericalGoalFormContainerState
> {
    public constructor(props: INumericalGoalFormContainerProps, context: any) {
        super(props, context);
        this.validateMaxProgress =
            debounce(this.validateMaxProgress, this.saveDelay);
    }

    public render() {
        const { maxProgress, maxProgressError } = this.state;
        return (
            <NumericalGoalForm
                maxProgress={maxProgress}
                maxProgressError={maxProgressError}
                isMaxProgressDisabled={!this.isNew()}
                onChangeMaxProgress={this.onChangeMaxProgress}
                {...this.getFormBaseProps()}
            />
        );
    }

    protected getTrackableType() {
        return TrackableType.NumericalGoal;
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

    protected doEditTrackable(trackable: IEditNumericalGoalFragment) {
        return this.props.onEditGoal(trackable);
    }

    protected isValidForAdd(state: INumericalGoalFormContainerState) {
        return state.maxProgressError === null;
    }

    protected isValidForEdit(state: INumericalGoalFormContainerState) {
        return !state.maxProgressError;
    }

    protected getInitialStateForAdd() {
        return {
            iconName: IconName.NumericalGoal as string,
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
    withDIContainer,
    withNetworkStatus,
    withApollo,
    withAddGoal,
    withEditGoal,
    withHeader,
    injectIntl,
)(NumericalGoalFormContainer);

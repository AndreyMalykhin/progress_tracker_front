import {
    addGymExercise,
    addGymExerciseQuery,
    IAddGymExerciseFragment,
    IAddGymExerciseResponse,
} from "actions/add-gym-exercise-action";
import {
    editGymExercise,
    editGymExerciseQuery,
    IEditGymExerciseFragment,
    IEditGymExerciseResponse,
} from "actions/edit-gym-exercise-action";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import GymExerciseForm from "components/gym-exercise-form";
import TrackableFormContainer, {
    ITrackable,
    ITrackableFormContainerProps,
    ITrackableFormContainerState,
} from "components/trackable-form-container";
import withHeader from "components/with-header";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { withApollo } from "react-apollo/withApollo";
import { RouteComponentProps, withRouter } from "react-router";

type IGymExercise = ITrackable;

interface IGymExerciseFormContainerProps extends
    ITrackableFormContainerProps<IGymExercise> {
    onAddGymExercise: (GymExercise: IAddGymExerciseFragment) => Promise<void>;
    onEditGymExercise: (GymExercise: IEditGymExerciseFragment) => void;
}

type IGymExerciseFormContainerState = ITrackableFormContainerState;

type IOwnProps = RouteComponentProps<{}> & {
    client: ApolloClient<NormalizedCacheObject>;
};

const withAddGymExercise = graphql<
    IAddGymExerciseResponse,
    IOwnProps,
    IGymExerciseFormContainerProps
>(
    addGymExerciseQuery,
    {
        props: ({ ownProps, mutate }) => {
            return {
                onAddGymExercise: (gymExercise: IAddGymExerciseFragment) => {
                    addGymExercise(gymExercise, mutate!, ownProps.client);
                },
            };
        },
    },
);

const withEditGymExercise = graphql<
    IEditGymExerciseResponse,
    IOwnProps,
    IGymExerciseFormContainerProps
>(
    editGymExerciseQuery,
    {
        props: ({ ownProps, mutate }) => {
            return {
                onEditGymExercise: (gymExercise: IEditGymExerciseFragment) => {
                    editGymExercise(gymExercise, mutate!, ownProps.client);
                },
            };
        },
    },
);

class GymExerciseFormContainer extends TrackableFormContainer<
    IGymExercise,
    IGymExerciseFormContainerProps,
    IGymExerciseFormContainerState
> {
    public render() {
        const {
            title,
            titleError,
            iconName,
            isPublic,
            isIconPickerOpen,
        } = this.state;
        const isPublicDisabled = this.isPublicDisabled(
            this.isNew(), this.props.isUserLoggedIn);
        return (
            <GymExerciseForm
                title={title!}
                titleError={titleError}
                availableIconNames={this.icons}
                iconName={iconName!}
                isPublic={isPublic!}
                isPublicDisabled={isPublicDisabled}
                isIconPickerOpen={isIconPickerOpen}
                onChangeTitle={this.onChangeTitle}
                onOpenIconPicker={this.onToggleIconPicker}
                onChangeIcon={this.onChangeIcon}
                onChangePublic={this.onChangePublic}
            />
        );
    }

    protected getTitleMsgId() {
        return "trackableTypes.gymExercise";
    }

    protected addTrackable() {
        const { title, iconName, isPublic } = this.state;
        return this.props.onAddGymExercise(
            { iconName, isPublic, title: title! });
    }

    protected saveTitle(title: string) {
        this.props.onEditGymExercise({ id: this.props.trackable!.id, title });
    }

    protected saveIconName(iconName: string) {
        this.props.onEditGymExercise(
            { id: this.props.trackable!.id, iconName });
    }

    protected isValidForAdd(state: IGymExerciseFormContainerState) {
        return true;
    }

    protected isValidForEdit(state: IGymExerciseFormContainerState) {
        return true;
    }

    protected getInitialStateForAdd() {
        return {
            iconName: "access-point",
        } as IGymExerciseFormContainerState;
    }

    protected getInitialStateForEdit() {
        return {} as IGymExerciseFormContainerState;
    }
}

export { IGymExercise };
export default compose(
    withRouter,
    withApollo,
    withAddGymExercise,
    withEditGymExercise,
    withHeader,
)(GymExerciseFormContainer);

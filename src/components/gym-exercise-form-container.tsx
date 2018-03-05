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
import withDIContainer from "components/with-di-container";
import withHeader from "components/with-header";
import withNetworkStatus from "components/with-network-status";
import TrackableType from "models/trackable-type";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { withApollo } from "react-apollo/withApollo";
import { injectIntl } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";
import IconName from "utils/icon-name";

type IGymExercise = ITrackable;

interface IGymExerciseFormContainerProps extends
    ITrackableFormContainerProps<IGymExercise> {
    onAddGymExercise: (GymExercise: IAddGymExerciseFragment) => Promise<any>;
    onEditGymExercise: (GymExercise: IEditGymExerciseFragment) => Promise<any>;
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
                onAddGymExercise: (gymExercise: IAddGymExerciseFragment) =>
                    addGymExercise(gymExercise, mutate!, ownProps.client),
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
                onEditGymExercise: (gymExercise: IEditGymExerciseFragment) =>
                    editGymExercise(gymExercise, mutate!, ownProps.client),
            };
        },
    },
);

class GymExerciseFormContainer extends TrackableFormContainer<
    IGymExercise,
    IEditGymExerciseFragment,
    IGymExerciseFormContainerProps,
    IGymExerciseFormContainerState
> {
    public render() {
        return <GymExerciseForm {...this.getFormBaseProps()} />;
    }

    protected getTrackableType() {
        return TrackableType.GymExercise;
    }

    protected getTitleMsgId() {
        return "trackableTypes.gymExercise";
    }

    protected doEditTrackable(trackable: IEditGymExerciseFragment) {
        return this.props.onEditGymExercise(trackable);
    }

    protected addTrackable() {
        const { title, iconName, isPublic } = this.state;
        return this.props.onAddGymExercise(
            { iconName, isPublic, title: title! });
    }

    protected isValidForAdd(state: IGymExerciseFormContainerState) {
        return true;
    }

    protected isValidForEdit(state: IGymExerciseFormContainerState) {
        return true;
    }

    protected getInitialStateForAdd() {
        return {
            iconName: IconName.GymExercise as string,
        } as IGymExerciseFormContainerState;
    }

    protected getInitialStateForEdit() {
        return {} as IGymExerciseFormContainerState;
    }
}

export { IGymExercise };
export default compose(
    withRouter,
    withDIContainer,
    withNetworkStatus,
    withApollo,
    withAddGymExercise,
    withEditGymExercise,
    withHeader,
    injectIntl,
)(GymExerciseFormContainer);

import {
    addCounter,
    addCounterQuery,
    IAddCounterFragment,
    IAddCounterResponse,
} from "actions/add-counter-action";
import {
    editCounter,
    editCounterQuery,
    IEditCounterFragment,
    IEditCounterResponse,
} from "actions/edit-counter-action";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import CounterForm from "components/counter-form";
import TrackableFormContainer, {
    ITrackable,
    ITrackableFormContainerProps,
    ITrackableFormContainerState,
} from "components/trackable-form-container";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { withApollo } from "react-apollo/withApollo";
import { RouteComponentProps, withRouter } from "react-router";

type ICounter = ITrackable;

interface ICounterFormContainerProps extends
    ITrackableFormContainerProps<ICounter> {
    onAddCounter: (counter: IAddCounterFragment) => Promise<void>;
    onEditCounter: (counter: IEditCounterFragment) => void;
}

type ICounterFormContainerState = ITrackableFormContainerState;

type IOwnProps = RouteComponentProps<{}> & {
    client: ApolloClient<NormalizedCacheObject>;
};

const withAddCounter = graphql<
    IAddCounterResponse,
    IOwnProps,
    ICounterFormContainerProps
>(
    addCounterQuery,
    {
        props: ({ ownProps, mutate }) => {
            return {
                onAddCounter: (counter: IAddCounterFragment) => {
                    addCounter(counter, mutate!, ownProps.client);
                },
            };
        },
    },
);

const withEditCounter = graphql<
    IEditCounterResponse,
    IOwnProps,
    ICounterFormContainerProps
>(
    editCounterQuery,
    {
        props: ({ ownProps, mutate }) => {
            return {
                onEditCounter: (counter: IEditCounterFragment) => {
                    editCounter(counter, mutate!, ownProps.client);
                },
            };
        },
    },
);

class CounterFormContainer extends TrackableFormContainer<
    ICounter,
    ICounterFormContainerProps,
    ICounterFormContainerState
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
            <CounterForm
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
        return "trackableTypes.counter";
    }

    protected addTrackable() {
        const { title, iconName, isPublic } = this.state;
        return this.props.onAddCounter(
            { iconName, isPublic, title: title! });
    }

    protected saveTitle(title: string) {
        this.props.onEditCounter({ id: this.props.trackable!.id, title });
    }

    protected saveIconName(iconName: string) {
        this.props.onEditCounter({ id: this.props.trackable!.id, iconName });
    }

    protected isValidForAdd(state: ICounterFormContainerState) {
        return true;
    }

    protected isValidForEdit(state: ICounterFormContainerState) {
        return true;
    }

    protected getInitialStateForAdd() {
        return {
            iconName: "access-point",
        } as ICounterFormContainerState;
    }

    protected getInitialStateForEdit() {
        return {} as ICounterFormContainerState;
    }
}

export { ICounter };
export default compose(
    withRouter,
    withApollo,
    withAddCounter,
    withEditCounter,
)(CounterFormContainer);

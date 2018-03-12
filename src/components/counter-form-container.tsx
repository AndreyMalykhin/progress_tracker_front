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
import PrimitiveTrackableFormContainer, {
    IPrimitiveTrackable,
    IPrimitiveTrackableFormContainerProps,
    IPrimitiveTrackableFormContainerState,
} from "components/primitive-trackable-form-container";
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

type ICounter = IPrimitiveTrackable;

interface ICounterFormContainerProps extends
    IPrimitiveTrackableFormContainerProps<ICounter> {
    onAddCounter: (counter: IAddCounterFragment) => Promise<any>;
    onEditCounter: (counter: IEditCounterFragment) => Promise<any>;
}

type ICounterFormContainerState = IPrimitiveTrackableFormContainerState;

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
                onAddCounter: (counter: IAddCounterFragment) =>
                    addCounter(counter, mutate!, ownProps.client),
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
                onEditCounter: (counter: IEditCounterFragment) =>
                    editCounter(counter, mutate!, ownProps.client),
            };
        },
    },
);

class CounterFormContainer extends PrimitiveTrackableFormContainer<
    ICounter,
    IEditCounterFragment,
    ICounterFormContainerProps,
    ICounterFormContainerState
> {
    public render() {
        return <CounterForm {...this.getFormBaseProps()} />;
    }

    protected getTrackableType() {
        return TrackableType.Counter;
    }

    protected getTitleMsgId() {
        return "trackableTypes.counter";
    }

    protected doEditTrackable(trackable: IEditCounterFragment) {
        return this.props.onEditCounter(trackable);
    }

    protected addTrackable() {
        const { title, iconName, isPublic } = this.state;
        return this.props.onAddCounter(
            { iconName, isPublic, title: title! });
    }

    protected isValidForAdd(state: ICounterFormContainerState) {
        return true;
    }

    protected isValidForEdit(state: ICounterFormContainerState) {
        return true;
    }

    protected getInitialStateForAdd() {
        return {
            ...super.getInitialStateForAdd(),
            iconName: IconName.Counter as string,
        } as ICounterFormContainerState;
    }
}

export { ICounter };
export default compose(
    withRouter,
    withDIContainer,
    withNetworkStatus,
    withApollo,
    withAddCounter,
    withEditCounter,
    withHeader,
    injectIntl,
)(CounterFormContainer);

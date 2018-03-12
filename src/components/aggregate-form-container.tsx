import {
    addAggregate,
    addAggregateQuery,
    IAddAggregateFragment,
    IAddAggregateResponse,
} from "actions/add-aggregate-action";
import {
    editAggregate,
    editAggregateQuery,
    IEditAggregateFragment,
    IEditAggregateResponse,
} from "actions/edit-aggregate-action";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import AggregateForm from "components/aggregate-form";
import TrackableFormContainer, {
    ITrackable, ITrackableFormContainerProps, ITrackableFormContainerState,
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

type IAggregate = ITrackable;

interface IAggregateFormContainerProps extends
    ITrackableFormContainerProps<IAggregate> {
    onAddAggregate: (aggregate: IAddAggregateFragment) => Promise<any>;
    onEditAggregate: (aggregate: IEditAggregateFragment) => Promise<any>;
}

type IAggregateFormContainerState = ITrackableFormContainerState;

type IOwnProps = RouteComponentProps<{}> & {
    client: ApolloClient<NormalizedCacheObject>;
};

const withAddAggregate = graphql<
    IAddAggregateResponse,
    IOwnProps,
    IAggregateFormContainerProps
>(
    addAggregateQuery,
    {
        props: ({ ownProps, mutate }) => {
            return {
                onAddAggregate: (aggregate: IAddAggregateFragment) =>
                    addAggregate(aggregate, mutate!, ownProps.client),
            };
        },
    },
);

const withEditAggregate = graphql<
    IEditAggregateResponse,
    IOwnProps,
    IAggregateFormContainerProps
>(
    editAggregateQuery,
    {
        props: ({ ownProps, mutate }) => {
            return {
                onEditAggregate: (aggregate: IEditAggregateFragment) =>
                    editAggregate(aggregate, mutate!, ownProps.client),
            };
        },
    },
);

class AggregateFormContainer extends TrackableFormContainer<
    IAggregate,
    IEditAggregateFragment,
    IAggregateFormContainerProps,
    IAggregateFormContainerState
> {
    public render() {
        return <AggregateForm {...this.getFormBaseProps()} />;
    }

    protected async afterAddTrackable() {
        // no op
    }

    protected getTrackableType() {
        return TrackableType.Aggregate;
    }

    protected getTitleMsgId() {
        return "trackableTypes.aggregate";
    }

    protected doEditTrackable(trackable: IEditAggregateFragment) {
        return this.props.onEditAggregate(trackable);
    }

    protected addTrackable() {
        const { title } = this.state;
        const childIds = this.props.history.location.state.trackableIds;
        return this.props.onAddAggregate({ title: title!, childIds });
    }

    protected isValidForAdd(state: IAggregateFormContainerState) {
        return true;
    }

    protected isValidForEdit(state: IAggregateFormContainerState) {
        return true;
    }

    protected getInitialStateForAdd() {
        return {} as IAggregateFormContainerState;
    }

    protected getInitialStateForEdit() {
        return {} as IAggregateFormContainerState;
    }
}

export { IAggregate };
export default compose(
    withRouter,
    withDIContainer,
    withNetworkStatus,
    withApollo,
    withAddAggregate,
    withEditAggregate,
    withHeader,
    injectIntl,
)(AggregateFormContainer);

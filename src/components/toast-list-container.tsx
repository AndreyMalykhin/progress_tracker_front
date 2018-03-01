import { removeToast } from "actions/toast-helpers";
import ToastList, { IToastListItem } from "components/toast-list";
import gql from "graphql-tag";
import * as React from "react";
import { compose, QueryProps, withApollo } from "react-apollo";
import graphql from "react-apollo/graphql";
import { IWithApolloProps } from "utils/interfaces";

interface IToastListContainerProps extends IWithApolloProps {
    data: QueryProps & IGetDataResponse;
}

interface IGetDataResponse {
    ui: {
        toasts: IToastListItem[];
    };
}

const getDataQuery = gql`
query GetData {
    ui @client {
        toasts {
            msg
        }
    }
}`;

const withData = graphql<IGetDataResponse, {}, IToastListContainerProps>(
    getDataQuery,
    {
        options: { fetchPolicy : "cache-only" },
    },
);

class ToastListContainer extends React.Component<IToastListContainerProps> {
    public render() {
        const { data } = this.props;
        return (
            <ToastList
                items={data.ui.toasts}
                onCloseToast={this.onCloseToast}
            />
        );
    }

    private onCloseToast = (index: number) =>
        removeToast(index, this.props.client)
}

export default compose(withData, withApollo)(ToastListContainer);

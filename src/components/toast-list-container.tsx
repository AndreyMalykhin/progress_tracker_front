import { removeToast } from "actions/toast-helpers";
import ToastList, { IToastListItem } from "components/toast-list";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import gql from "graphql-tag";
import * as React from "react";
import { compose, QueryProps, withApollo } from "react-apollo";
import graphql from "react-apollo/graphql";
import { IWithApolloProps } from "utils/interfaces";
import Sound from "utils/sound";

interface IToastListContainerProps extends
    IWithApolloProps, IWithDIContainerProps {
    data: QueryProps & IGetDataResponse;
}

interface IGetDataResponse {
    ui: {
        toasts: Array<IToastListItem & {
            sound?: Sound;
        }>;
    };
}

const getDataQuery = gql`
query GetData {
    ui @client {
        toasts {
            msgId
            msgValues
            severity
            sound
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
                onOpenToast={this.onOpenToast}
            />
        );
    }

    private onCloseToast = (index: number) =>
        removeToast(index, this.props.client)

    private onOpenToast = (index: number) => {
        const sound = this.props.data.ui.toasts[index].sound;

        if (sound) {
            this.props.diContainer.audioManager.play(sound);
        }
    }
}

export default compose(withDIContainer, withApollo, withData)(
    ToastListContainer);

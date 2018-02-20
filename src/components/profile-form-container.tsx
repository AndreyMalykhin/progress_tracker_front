import {
    editUser,
    editUserQuery,
    IEditUserFragment,
    IEditUserResponse,
} from "actions/edit-user-action";
import {
    ISetUserAvatarResponse,
    setUserAvatar,
    setUserAvatarQuery,
} from "actions/set-user-avatar-action";
import { addGenericErrorToast } from "actions/toast-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { isApolloError } from "apollo-client/errors/ApolloError";
import Error from "components/error";
import Loader from "components/loader";
import ProfileForm from "components/profile-form";
import withError from "components/with-error";
import withHeader, { IWithHeaderProps } from "components/with-header";
import withLoader from "components/with-loader";
import withSession, { IWithSessionProps } from "components/with-session";
import gql from "graphql-tag";
import { debounce } from "lodash";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { withApollo } from "react-apollo/withApollo";
import { FormattedMessage } from "react-intl";
import { Image } from "react-native-image-crop-picker";
import { RouteComponentProps, withRouter } from "react-router";
import getDataOrQueryStatus from "utils/get-data-or-query-status";
import { IWithApolloProps } from "utils/interfaces";
import QueryStatus from "utils/query-status";

interface IProfileFormContainerProps extends
    IWithHeaderProps, RouteComponentProps<{}>, IOwnProps {
    data: QueryProps & IGetDataResponse;
    onSetAvatar: (img: Image|null) => Promise<any>;
    onEditUser: (user: IEditUserFragment) => Promise<any>;
}

interface IProfileFormContainerState {
    isAvatarChanging?: boolean;
    avatarUri: string;
    avatarError?: string|null;
    name: string;
    nameError?: string|null;
}

interface IOwnProps extends IWithSessionProps, IWithApolloProps {}

interface IGetDataResponse {
    getUserById: {
        id: string;
        name: string;
        avatarUrlMedium: string;
    };
}

const withSetAvatar =
    graphql<ISetUserAvatarResponse, IOwnProps, IProfileFormContainerProps>(
        setUserAvatarQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onSetAvatar: (img: Image|null) =>
                        setUserAvatar(img, mutate!, ownProps.client),
                };
            },
        },
    );

const withEditUser =
    graphql<IEditUserResponse, IOwnProps, IProfileFormContainerProps>(
        editUserQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onEditUser: (user: IEditUserFragment) =>
                        editUser(user, mutate!, ownProps.client),
                };
            },
        },
    );

const getDataQuery = gql`
query GetData($userId: ID!) {
    getUserById(id: $userId) {
        id
        name
        avatarUrlMedium
    }
}`;

const withData =
    graphql<IGetDataResponse, IOwnProps, IProfileFormContainerProps>(
        getDataQuery,
        {
            options: (ownProps) => {
                return {
                    notifyOnNetworkStatusChange: true,
                    variables: { userId: ownProps.session.userId },
                };
            },
            props: ({ data }) => {
                return getDataOrQueryStatus(data!);
            },
            skip: (ownProps: IOwnProps) => {
                return !ownProps.session.userId;
            },
        },
    );

class ProfileFormContainer extends
    React.Component<IProfileFormContainerProps, IProfileFormContainerState> {
    public state = {} as IProfileFormContainerState;

    public constructor(props: IProfileFormContainerProps, context: any) {
        super(props, context);
        this.saveName = debounce(this.saveName, 512);
    }

    public render() {
        const isUserLoggedIn = this.props.session.accessToken != null;
        const { avatarError, avatarUri, name, nameError, isAvatarChanging } =
            this.state;
        return (
            <ProfileForm
                avatarError={avatarError}
                avatarUri={avatarUri}
                isAvatarDisabled={!isUserLoggedIn}
                isAvatarChanging={isAvatarChanging}
                isNameDisabled={!isUserLoggedIn}
                isUserLoggedIn={isUserLoggedIn}
                name={name}
                nameError={nameError}
                onChangeAvatar={this.onChangeAvatar}
                onChangeName={this.onChangeName}
            />
        );
    }

    public componentWillMount() {
        this.init(this.props, () => {
            this.updateHeader(this.isValid(this.state));
        });
    }

    public componentWillReceiveProps(nextProps: IProfileFormContainerProps) {
        const prevUser = this.props.data.getUserById;
        const nextUser = nextProps.data.getUserById;

        if (this.props.session.accessToken !== nextProps.session.accessToken
            || prevUser.avatarUrlMedium !== nextUser.avatarUrlMedium
        ) {
            this.init(nextProps);
        }
    }

    public componentDidUpdate(
        prevProps: IProfileFormContainerProps,
        prevState: IProfileFormContainerState,
    ) {
        const isValid = this.isValid(this.state);

        if (isValid !== this.isValid(prevState)) {
            this.updateHeader(isValid);
        }
    }

    private isValid(state: IProfileFormContainerState) {
        return !state.avatarError && !state.nameError;
    }

    private updateHeader(isValid: boolean) {
        this.props.header.replace({
            hideBackCommand: true,
            rightCommands: [
                {
                    isDisabled: !isValid,
                    msgId: "common.done",
                    onRun: this.onDone,
                },
            ],
            title: <FormattedMessage id="profileForm.title" />,
        });
    }

    private init(props: IProfileFormContainerProps, onDone?: () => void) {
        const { avatarUrlMedium, name } = props.data.getUserById;
        this.setState({
            avatarError: undefined,
            avatarUri: avatarUrlMedium,
            isAvatarChanging: false,
            name,
            nameError: undefined,
        }, onDone);
    }

    private onChangeAvatar = async (img: Image|null) => {
        if (img) {
            this.setState({ isAvatarChanging: true });
        }

        await this.transaction(() => this.props.onSetAvatar(img));

        if (img) {
            this.setState({ isAvatarChanging: false });
        }
    }

    private onChangeName = (name: string) => {
        this.setState({ name });
        this.saveName(name);
    }

    private saveName = (name: string) => {
        const nameError = !name ? "errors.emptyValue" : null;
        this.setState({ nameError });

        if (!nameError) {
            this.transaction(() => this.props.onEditUser({ name }));
        }
    }

    private onDone = () => this.props.history.goBack();

    private async transaction(action: () => Promise<any>) {
        try {
            await action();
        } catch (e) {
            this.init(this.props);

            if (!isApolloError(e)) {
                addGenericErrorToast(this.props.client);
            }
        }
    }
}

export default compose(
    withRouter,
    withSession,
    withData,
    withLoader(Loader, 512),
    withError(Error),
    withApollo,
    withSetAvatar,
    withEditUser,
    withHeader,
)(ProfileFormContainer);

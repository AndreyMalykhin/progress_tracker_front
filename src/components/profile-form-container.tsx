import {
    editUser,
    editUserQuery,
    IEditUserFragment,
    IEditUserResponse,
} from "actions/edit-user-action";
import { ILoginResponse, login, loginQuery } from "actions/login-action";
import {
    ISetUserAvatarResponse,
    setUserAvatar,
    setUserAvatarQuery,
} from "actions/set-user-avatar-action";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import Error from "components/error";
import { HeaderTitle, IWithHeaderProps, withHeader } from "components/header";
import Loader from "components/loader";
import ProfileForm from "components/profile-form";
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
import myId from "utils/my-id";
import QueryStatus from "utils/query-status";
import withError from "utils/with-error";
import withLoader from "utils/with-loader";

interface IGetDataResponse {
    getUserById: {
        id: string;
        accessToken?: string;
        name: string;
        avatarUrlMedium: string;
    };
}

interface IProfileFormContainerProps extends
    IWithHeaderProps, RouteComponentProps<{}> {
    data: QueryProps & IGetDataResponse;
    onSetAvatar: (img?: Image) => void;
    onEditUser: (user: IEditUserFragment) => void;
    onLogin: () => void;
}

interface IProfileFormContainerState {
    avatarUri: string;
    avatarError?: string|null;
    name: string;
    nameError?: string|null;
}

interface IOwnProps {
    client: ApolloClient<NormalizedCacheObject>;
}

const withLogin =
    graphql<ILoginResponse, IOwnProps, IProfileFormContainerProps>(
        loginQuery,
        {
            props: ({ mutate }) => {
                return {
                    onLogin: () => login(mutate!),
                };
            },
        },
    );

const withSetAvatar =
    graphql<ISetUserAvatarResponse, IOwnProps, IProfileFormContainerProps>(
        setUserAvatarQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onSetAvatar: (img?: Image) =>
                        setUserAvatar(img || null, mutate!, ownProps.client),
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
        accessToken
        name
        avatarUrlMedium
    }
}`;

const withData =
    graphql<IGetDataResponse, IOwnProps, IProfileFormContainerProps>(
        getDataQuery,
        {
            options: () => {
                return {
                    variables: { userId: myId },
                };
            },
            props: ({ data }) => {
                const queryStatus = data!.networkStatus;

                if (queryStatus === QueryStatus.InitialLoading
                    || queryStatus === QueryStatus.Error
                ) {
                    return { queryStatus };
                }

                return { data, queryStatus };
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
        const isUserLoggedIn = this.props.data.getUserById.accessToken != null;
        const { avatarError, avatarUri, name, nameError } = this.state;
        return (
            <ProfileForm
                avatarError={avatarError}
                avatarUri={avatarUri}
                isAvatarDisabled={!isUserLoggedIn}
                isNameDisabled={!isUserLoggedIn}
                isUserLoggedIn={isUserLoggedIn}
                name={name}
                nameError={nameError}
                onChangeAvatar={this.onChangeAvatar}
                onChangeName={this.onChangeName}
                onLogin={this.onLogin}
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

        if (prevUser.accessToken !== nextUser.accessToken
            || prevUser.avatarUrlMedium !== nextUser.avatarUrlMedium
        ) {
            this.init(nextProps);
        }
    }

    public componentWillUpdate(
        nextProps: IProfileFormContainerProps,
        nextState: IProfileFormContainerState,
    ) {
        const nextIsValid = this.isValid(nextState);

        if (this.isValid(this.state) !== nextIsValid) {
            this.updateHeader(nextIsValid);
        }
    }

    private isValid(state: IProfileFormContainerState) {
        return !state.avatarError && !state.nameError;
    }

    private updateHeader(isValid: boolean) {
        const title = (
            <HeaderTitle>
                <FormattedMessage id="profileForm.title" />
            </HeaderTitle>
        );
        this.props.header.replace({
            hideBackCommand: true,
            rightCommands: [
                {
                    isDisabled: !isValid,
                    msgId: "common.done",
                    onRun: this.onDone,
                },
            ],
            title,
        });
    }

    private init(props: IProfileFormContainerProps, callback?: () => void) {
        const { avatarUrlMedium, name } = props.data.getUserById;
        this.setState({
            avatarError: undefined,
            avatarUri: avatarUrlMedium,
            name,
            nameError: undefined,
        }, callback);
    }

    private onChangeAvatar = (img?: Image) => {
        this.props.onSetAvatar(img);
    }

    private onLogin = () => this.props.onLogin();

    private onChangeName = (name: string) => {
        this.setState({ name });
        this.saveName(name);
    }

    private saveName = (name: string) => {
        const nameError = !name ? "errors.emptyValue" : null;

        if (!nameError) {
            this.props.onEditUser({ name });
        }

        this.setState({ nameError });
    }

    private onDone = () => this.props.history.goBack();
}

export default compose(
    withRouter,
    withData,
    withLoader(Loader),
    withError(Error),
    withApollo,
    withSetAvatar,
    withLogin,
    withEditUser,
    withHeader,
)(ProfileFormContainer);

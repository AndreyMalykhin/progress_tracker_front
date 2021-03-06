import {
    editUser,
    editUserQuery,
    IEditUserFragment,
    IEditUserResponse,
} from "actions/edit-user-action";
import { logout } from "actions/logout-action";
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
import { HeaderAnimation } from "components/header";
import Loader from "components/loader";
import Offline from "components/offline";
import ProfileForm from "components/profile-form";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import withError from "components/with-error";
import withFetchPolicy, {
    IWithFetchPolicyProps,
} from "components/with-fetch-policy";
import withHeader, { IWithHeaderProps } from "components/with-header";
import withLoader from "components/with-loader";
import withNetworkStatus, {
    IWithNetworkStatusProps,
} from "components/with-network-status";
import withOffline from "components/with-offline";
import withSession, { IWithSessionProps } from "components/with-session";
import withSyncStatus, {
    IWithSyncStatusProps,
} from "components/with-sync-status";
import gql from "graphql-tag";
import { debounce } from "lodash";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { withApollo } from "react-apollo/withApollo";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import { Alert } from "react-native";
import { Image } from "react-native-image-crop-picker";
import { RouteComponentProps, withRouter } from "react-router";
import Analytics from "utils/analytics";
import AnalyticsEvent from "utils/analytics-event";
import { IWithApolloProps } from "utils/interfaces";
import makeLog from "utils/make-log";
import QueryStatus from "utils/query-status";
import routes from "utils/routes";

const log = makeLog("profile-form-container");

interface IProfileFormContainerProps extends
    IWithHeaderProps,
    RouteComponentProps<{}>,
    IOwnProps,
    InjectedIntlProps,
    IWithSyncStatusProps {
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

interface IOwnProps extends
    IWithSessionProps,
    IWithApolloProps,
    IWithFetchPolicyProps,
    IWithDIContainerProps,
    IWithNetworkStatusProps {}

interface IGetDataResponse {
    getUser: {
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
                        setUserAvatar(
                            img,
                            mutate!,
                            ownProps.client,
                        ),
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
query GetData($userId: ID) {
    getUser(id: $userId) {
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
                    fetchPolicy: ownProps.fetchPolicy,
                    notifyOnNetworkStatusChange: true,
                };
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
        const { isOnline, session } = this.props;
        const isUserLoggedIn = session.accessToken != null;
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
                onLogout={this.onLogout}
            />
        );
    }

    public componentWillMount() {
        this.init(this.props, () => {
            this.updateHeader(this.isValid(this.state));
        });
    }

    public componentWillReceiveProps(nextProps: IProfileFormContainerProps) {
        const prevUser = this.props.data.getUser;
        const nextUser = nextProps.data.getUser;

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
        const title =
            this.props.intl.formatMessage({ id: "profileForm.title" });
        this.props.header.replace({
            hideBackCommand: true,
            key: "profileFormContainer.index",
            rightCommands: [
                {
                    isDisabled: !isValid,
                    isPrimary: true,
                    msgId: "common.done",
                    onRun: this.onDone,
                },
            ],
            title,
        });
    }

    private init(props: IProfileFormContainerProps, onDone?: () => void) {
        const { avatarUrlMedium, name } = props.data.getUser;
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
            Analytics.log(AnalyticsEvent.ProfileFormSetAvatar);
            this.setState({ isAvatarChanging: true });
        } else {
            Analytics.log(AnalyticsEvent.ProfileFormRemoveAvatar);
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
        let nameError: string | null = null;

        if (!name) {
            nameError = "errors.empty";
        } else if (name.length > 128) {
            nameError = "errors.tooLong";
        }

        this.setState({ nameError });

        if (!nameError) {
            Analytics.log(AnalyticsEvent.ProfileFormSetName);
            this.transaction(() => this.props.onEditUser({ name }));
        }
    }

    private onDone = () => {
        Analytics.log(AnalyticsEvent.ProfileFormClose);
        this.props.history.goBack();
    }

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

    private onLogout = async () => {
        if (this.props.isSyncing && !await this.confirmLogout()) {
            return;
        }

        Analytics.log(AnalyticsEvent.ProfileFormLogout);

        try {
            await logout(this.props.history, this.props.client);
        } catch (e) {
            if (!isApolloError(e)) {
                addGenericErrorToast(this.props.client);
            }
        }
    }

    private confirmLogout() {
        return new Promise((resolve) => {
            const msg = undefined;
            const { formatMessage } = this.props.intl;
            const title =
                formatMessage({ id: "logout.synchronizationInProgressTitle" });
            Alert.alert(title, msg, [
                {
                    onPress: () => resolve(false),
                    style: "cancel",
                    text: formatMessage({ id: "common.cancel" }),
                },
                {
                    onPress: () => resolve(true),
                    text: formatMessage({ id: "common.logout" }),
                },
            ]);
        });
    }
}

export default compose(
    withRouter,
    withDIContainer,
    withSession,
    withNetworkStatus,
    withSyncStatus,
    withFetchPolicy({
        isMyData: () => true,
        isReadonlyData: () => false,
    }),
    withData,
    withLoader<IProfileFormContainerProps, IGetDataResponse>(Loader, {
        dataField: "getUser",
        getQuery: (props) => props.data,
    }),
    withError<IProfileFormContainerProps, IGetDataResponse>(Error, {
        dataField: "getUser",
        getQuery: (props) => props.data,
    }),
    withOffline<IProfileFormContainerProps, IGetDataResponse>(Offline, {
        dataField: "getUser",
        getQuery: (props) => props.data,
    }),
    withApollo,
    withSetAvatar,
    withEditUser,
    withHeader,
    injectIntl,
)(ProfileFormContainer);

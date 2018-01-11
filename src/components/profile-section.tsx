import ActiveTrackables from "components/active-trackables";
import ArchivedTrackables from "components/archived-trackables";
import Header, {
    HeaderSubtitle,
    HeaderTitle,
    IHeaderCmd,
    IHeaderState,
} from "components/header";
import NewTrackablePicker from "components/new-trackable-picker";
import ProfileNav from "components/profile-nav";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Route, Switch } from "react-router";
import routes from "utils/routes";
import TrackableType from "utils/trackable-type";

interface IProfileSectionProps {
    loading: boolean;
    isMe: boolean;
    userId: string;
    userName: string;
    userRating: number;
    userSmallAvatarUrl: string;
    onOpenProfileForm: () => void;
    onReportUser: (id: string) => void;
    onNewTrackableSelect: (trackableType: TrackableType) => void;
    onUpdateHeader: (state: IHeaderState|null) => void;
}

interface IProfileSectionState {
    isNewTrackablePickerOpen: boolean;
}

class ProfileSection
    extends React.Component<IProfileSectionProps, IProfileSectionState> {
    public state: IProfileSectionState = {
        isNewTrackablePickerOpen: false,
    };
    private navItems = [
        {
            component: ActiveTrackables,
            matchExact: routes.profileActiveTrackables.exact,
            matchPath: routes.profileActiveTrackables.path,
            navigateToPath: routes.profileMyActiveTrackables.path,
            title: "profile.activeTrackables",
        },
        {
            component: ArchivedTrackables,
            matchExact: routes.profileArchive.exact,
            matchPath: routes.profileArchive.path,
            navigateToPath: routes.profileMyArchive.path,
            title: "profile.archive",
        },
    ];

    public render() {
        const routeElements = this.navItems.map((route) => {
            return (
                <Route
                    key={route.matchPath}
                    exact={route.matchExact}
                    path={route.matchPath}
                    component={route.component}
                />
            );
        });

        return (
            <View style={{ flex: 1 }}>
                <ProfileNav items={this.navItems} />
                <View style={{ flex: 1 }}>
                    <Switch>{routeElements}</Switch>
                </View>
                <NewTrackablePicker
                    isOpen={this.state.isNewTrackablePickerOpen}
                    onSelect={this.onNewTrackablePickerSelect}
                />
            </View>
        );
    }

    public componentWillReceiveProps(nextProps: IProfileSectionProps) {
        const nextUserId = nextProps.userId;
        const { userId, userRating, userName, loading } = this.props;

        if (userId !== nextUserId) {
            this.navItems = this.navItems.map((route) => {
                return {
                    ...route,
                    navigateToPath: route.matchPath.replace(":id", nextUserId),
                };
            });
        }

        if (userId !== nextUserId
            || userRating !== nextProps.userRating
            || loading !== nextProps.loading
        ) {
            this.updateHeader(nextProps.loading);
        }
    }

    public componentWillMount() {
        this.updateHeader(this.props.loading);
    }

    private updateHeader(isLoading: boolean) {
        const {
            isMe,
            userRating,
            userName,
            userSmallAvatarUrl,
            onUpdateHeader,
        } = this.props;

        if (isLoading) {
            onUpdateHeader(null);
            return;
        }

        const subtitle = (
            <HeaderSubtitle>
                <Icon name="star-circle" />{userRating}
            </HeaderSubtitle>
        );
        const profileCmd = {
            action: this.openProfileForm,
            imgUrl: userSmallAvatarUrl,
            msgId: isMe ? "commands.edit" : "commands.profile",
        } as IHeaderCmd;
        const rightCommands: IHeaderCmd[] = [];

        if (isMe) {
            const newTrackableCmd = {
                action: this.onNewTrackable,
                iconName: "plus",
                msgId: "commands.new",
            } as IHeaderCmd;
            rightCommands.push(newTrackableCmd);
        } else {
            const reportCmd = {
                action: this.reportUser,
                iconName: "exclamation",
                msgId: "commands.report",
            } as IHeaderCmd;
            rightCommands.push(reportCmd);
        }

        onUpdateHeader({
            leftCommand: profileCmd,
            rightCommands,
            subtitle,
            title: <HeaderTitle>{userName}</HeaderTitle>,
        });
    }

    private openProfileForm = () => {
        const { isMe, onOpenProfileForm } = this.props;

        if (!isMe) {
            return;
        }

        onOpenProfileForm();
    }

    private reportUser = () => {
        const { userId, onReportUser } = this.props;
        onReportUser(userId);
    }

    private onNewTrackable = () => {
        this.setState({ isNewTrackablePickerOpen: true });
    }

    private onNewTrackablePickerSelect = (trackableType?: TrackableType) => {
        this.setState({ isNewTrackablePickerOpen: false });

        if (trackableType == null) {
            return;
        }

        this.props.onNewTrackableSelect(trackableType);
    }
}

export { IProfileSectionProps };
export default ProfileSection;

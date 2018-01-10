import ActiveTrackables from "components/active-trackables";
import ArchivedTrackables from "components/archived-trackables";
import Header, {
    HeaderSubtitle,
    HeaderTitle,
    IHeaderCmd,
    IHeaderState,
} from "components/header";
import ProfileNav from "components/profile-nav";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Route, Switch } from "react-router";
import routes from "utils/routes";

interface IProfileSectionProps {
    loading: boolean;
    isMe: boolean;
    userId: string;
    userName: string;
    userRating: number;
    userSmallAvatarUrl: string;
    openProfileForm: () => void;
    reportUser: () => void;
    newTrackable: () => void;
    updateHeader: (state: IHeaderState|null) => void;
}

class ProfileSection extends React.Component<IProfileSectionProps> {
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
            </View>
        );
    }

    public componentWillReceiveProps(nextProps: IProfileSectionProps) {
        const nextUserId = nextProps.userId;

        if (this.props.userId !== nextUserId) {
            this.navItems = this.navItems.map((route) => {
                return {
                    ...route,
                    navigateToPath: route.matchPath.replace(":id", nextUserId),
                };
            });
        }

        this.updateHeader(nextProps.loading);
    }

    public componentWillMount() {
        this.updateHeader(this.props.loading);
    }

    private updateHeader(isLoading: boolean) {
        const {
            isMe,
            userRating,
            userName,
            userId,
            userSmallAvatarUrl,
            openProfileForm,
            updateHeader,
            newTrackable,
            reportUser,
        } = this.props;

        if (isLoading) {
            updateHeader(null);
            return;
        }

        const subtitle = (
            <HeaderSubtitle>
                <Icon name="star-circle" />{userRating}
            </HeaderSubtitle>
        );
        const profileCmd = {
            action: () => isMe && openProfileForm(),
            imgUrl: userSmallAvatarUrl,
            msgId: isMe ? "commands.edit" : "commands.profile",
        } as IHeaderCmd;
        const rightCommands: IHeaderCmd[] = [];

        if (isMe) {
            const newTrackableCmd = {
                action: newTrackable,
                iconName: "plus",
                msgId: "commands.new",
            } as IHeaderCmd;
            rightCommands.push(newTrackableCmd);
        } else {
            const reportCmd = {
                action: reportUser,
                iconName: "exclamation",
                msgId: "commands.report",
            } as IHeaderCmd;
            rightCommands.push(reportCmd);
        }

        updateHeader({
            leftCommand: profileCmd,
            rightCommands,
            subtitle,
            title: <HeaderTitle>{userName}</HeaderTitle>,
        });
    }
}

export { IProfileSectionProps };
export default ProfileSection;

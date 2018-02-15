import Avatar from "components/avatar";
import Loader from "components/loader";
import Audience from "models/audience";
import Type from "models/type";
import * as React from "react";
import { FormattedDate, FormattedMessage, MessageValue } from "react-intl";
import {
    ListRenderItem,
    SectionList,
    SectionListData,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import IconName from "utils/icon-name";
import QueryStatus from "utils/query-status";

interface IActivityListProps {
    audience: Audience;
    sections: IActivityListSection[];
    queryStatus: QueryStatus;
    onEndReached: () => void;
    onPressUser: (id: string) => void;
}

interface IActivityListSection {
    date: number;
    data: IActivityListItem[];
    key: string;
}

interface IActivityListItem {
    node: IActivityListItemNode;
}

type IActivityListItemNode = ITrackableAddedActivity
    | ICounterProgressChangedActivity
    | INumericalGoalProgressChangedActivity
    | ITaskGoalProgressChangedActivity
    | IGymExerciseEntryAddedActivity
    | IGoalApprovedActivity
    | IGoalRejectedActivity;

interface IUserNameProps {
    id: string;
    name: string;
    onPress: (id: string) => void;
}

interface INumberProps {
    value: number;
}

interface ITrackableTitleProps {
    text: string;
}

interface ISectionHeaderProps {
    date: number;
}

interface IBaseActivityProps {
    userId?: string;
    userAvatarUrl?: string;
    userName?: string;
    onPressUser: (id: string) => void;
}

interface IActivityProps extends IBaseActivityProps {
    msgId: string;
    msgValues: { [key: string]: JSX.Element | MessageValue };
    iconName: string;
    iconStyle?: StyleProp<TextStyle>;
}

interface IActivity {
    __typename: Type;
    id: string;
    date: number;
    user?: {
        id: string;
        name: string;
        avatarUrlSmall: string;
    };
}

interface ITrackableAddedActivityProps extends IBaseActivityProps {
    trackableTitle: string;
}

interface ITrackableAddedActivity extends IActivity {
    trackable: {
        title: string;
    };
}

interface ICounterProgressChangedActivity extends IActivity {
    trackable: {
        title: string;
    };
    delta: number;
}

interface ICounterProgressChangedActivityProps extends IBaseActivityProps {
    trackableTitle: string;
    progressDelta: number;
}

interface INumericalGoalProgressChangedActivity extends IActivity {
    trackable: {
        title: string;
    };
    delta: number;
}

interface INumericalGoalProgressChangedActivityProps extends
    IBaseActivityProps {
    trackableTitle: string;
    progressDelta: number;
}

interface ITaskGoalProgressChangedActivity extends IActivity {
    trackable: {
        title: string;
    };
    task: {
        title: string;
    };
}

interface ITaskGoalProgressChangedActivityProps extends IBaseActivityProps {
    trackableTitle: string;
    taskTitle: string;
}

interface IGymExerciseEntryAddedActivity extends IActivity {
    trackable: {
        title: string;
    };
    entry: {
        setCount: number;
        repetitionCount: number;
        weight: number;
    };
}

interface IGymExerciseEntryAddedActivityProps extends IBaseActivityProps {
    trackableTitle: string;
    setCount: number;
    repetitionCount: number;
    weight: number;
}

interface IGoalApprovedActivity extends IActivity {
    trackable: {
        title: string;
    };
    ratingDelta?: number;
}

interface IGoalApprovedActivityProps extends IBaseActivityProps {
    trackableTitle: string;
    ratingDelta?: number;
}

interface IGoalRejectedActivity extends IActivity {
    trackable: {
        title: string;
    };
}

interface IGoalRejectedActivityProps extends IBaseActivityProps {
    trackableTitle: string;
}

interface IGoalAchievedActivity extends IActivity {
    trackable: {
        title: string;
    };
}

interface IGoalAchievedActivityProps extends IBaseActivityProps {
    trackableTitle: string;
}

interface IGoalExpiredActivity extends IActivity {
    trackable: {
        title: string;
    };
}

interface IGoalExpiredActivityProps extends IBaseActivityProps {
    trackableTitle: string;
}

interface IExternalGoalReviewedActivity extends IActivity {
    trackable: {
        title: string;
        user: {
            id: string;
            name: string;
        }
    };
    isApprove: boolean;
    ratingDelta?: number;
}

interface IExternalGoalReviewedActivityProps extends IBaseActivityProps {
    trackableTitle: string;
    externalUserId: string;
    externalUserName: string;
    isApprove: boolean;
    ratingDelta?: number;
    onPressUser: (id: string) => void;
}

class ActivityList extends React.Component<IActivityListProps> {
    public render() {
        const { sections, queryStatus, onEndReached } = this.props;
        const loader = queryStatus === QueryStatus.LoadingMore ? Loader : null;
        return (
            <SectionList
                windowSize={12}
                initialNumToRender={10}
                keyExtractor={this.getItemKey}
                renderItem={this.onRenderItem}
                renderSectionHeader={this.onRenderSectionHeader}
                sections={sections}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={loader}
                onEndReachedThreshold={0.5}
                onEndReached={onEndReached}
            />
        );
    }

    private getItemKey(item: IActivityListItem) {
        return item.node.id;
    }

    private onRenderSectionHeader = (
        info: { section: SectionListData<IActivityListItem> },
    ) => {
        return <SectionHeader date={info.section.date} />;
    }

    private onRenderItem: ListRenderItem<IActivityListItem> = (itemInfo) => {
        const item = itemInfo.item.node;

        switch (item.__typename) {
            case Type.TrackableAddedActivity:
            return this.renderTrackableAdded(item as ITrackableAddedActivity);
            case Type.CounterProgressChangedActivity:
            return this.renderCounterProgressChanged(
                item as ICounterProgressChangedActivity);
            case Type.TaskGoalProgressChangedActivity:
            return this.renderTaskGoalProgressChanged(
                item as ITaskGoalProgressChangedActivity);
            case Type.GymExerciseEntryAddedActivity:
            return this.renderGymExerciseEntryAdded(
                item as IGymExerciseEntryAddedActivity);
            case Type.NumericalGoalProgressChangedActivity:
            return this.renderNumericalGoalProgressChanged(
                item as INumericalGoalProgressChangedActivity);
            case Type.GoalApprovedActivity:
            return this.renderGoalApproved(item as IGoalApprovedActivity);
            case Type.GoalRejectedActivity:
            return this.renderGoalRejected(item as IGoalRejectedActivity);
            case Type.GoalAchievedActivity:
            return this.renderGoalAchieved(item as IGoalAchievedActivity);
            case Type.GoalExpiredActivity:
            return this.renderGoalExpired(item as IGoalExpiredActivity);
            case Type.ExternalGoalReviewedActivity:
            return this.renderExternalGoalReviewed(
                item as IExternalGoalReviewedActivity);
            default:
            throw new Error("Unexpected type: " + item.__typename);
        }
    }

    private renderExternalGoalReviewed(item: IExternalGoalReviewedActivity) {
        const { trackable, isApprove, ratingDelta } = item;
        return (
            <ExternalGoalReviewedActivity
                externalUserId={trackable.user.id}
                externalUserName={trackable.user.name}
                isApprove={isApprove}
                trackableTitle={trackable.title}
                ratingDelta={ratingDelta}
                {...this.getBaseActivityProps(item)}
            />
        );
    }

    private renderGoalExpired(item: IGoalExpiredActivity) {
        const { trackable } = item;
        return (
            <GoalExpiredActivity
                trackableTitle={trackable.title}
                {...this.getBaseActivityProps(item)}
            />
        );
    }

    private renderGoalAchieved(item: IGoalAchievedActivity) {
        const { trackable } = item;
        return (
            <GoalAchievedActivity
                trackableTitle={trackable.title}
                {...this.getBaseActivityProps(item)}
            />
        );
    }

    private renderGoalRejected(item: IGoalRejectedActivity) {
        const { trackable } = item;
        return (
            <GoalRejectedActivity
                trackableTitle={trackable.title}
                {...this.getBaseActivityProps(item)}
            />
        );
    }

    private renderGoalApproved(item: IGoalApprovedActivity) {
        const { trackable, ratingDelta } = item;
        return (
            <GoalApprovedActivity
                trackableTitle={trackable.title}
                ratingDelta={ratingDelta}
                {...this.getBaseActivityProps(item)}
            />
        );
    }

    private renderNumericalGoalProgressChanged(
        item: INumericalGoalProgressChangedActivity,
    ) {
        const { trackable, delta } = item;
        return (
            <NumericalGoalProgressChangedActivity
                trackableTitle={trackable.title}
                progressDelta={delta}
                {...this.getBaseActivityProps(item)}
            />
        );
    }

    private renderGymExerciseEntryAdded(item: IGymExerciseEntryAddedActivity) {
        const { trackable, entry } = item;
        return (
            <GymExerciseEntryAddedActivity
                trackableTitle={trackable.title}
                setCount={entry.setCount}
                repetitionCount={entry.repetitionCount}
                weight={entry.weight}
                {...this.getBaseActivityProps(item)}
            />
        );
    }

    private renderTrackableAdded(item: ITrackableAddedActivity) {
        const { trackable } = item;
        return (
            <TrackableAddedActivity
                trackableTitle={trackable.title}
                {...this.getBaseActivityProps(item)}
            />
        );
    }

    private renderCounterProgressChanged(
        item: ICounterProgressChangedActivity,
    ) {
        const { trackable, delta } = item;
        return (
            <CounterProgressChangedActivity
                trackableTitle={trackable.title}
                progressDelta={delta}
                {...this.getBaseActivityProps(item)}
            />
        );
    }

    private renderTaskGoalProgressChanged(
        item: ITaskGoalProgressChangedActivity,
    ) {
        const { trackable, task } = item;
        return (
            <TaskGoalProgressChangedActivity
                trackableTitle={trackable.title}
                taskTitle={task.title}
                {...this.getBaseActivityProps(item)}
            />
        );
    }

    private getBaseActivityProps(item: IActivity) {
        if (this.props.audience === Audience.Me) {
            return { onPressUser: this.props.onPressUser };
        }

        const { user } = item;
        return {
            onPressUser: this.props.onPressUser,
            userAvatarUrl: user!.avatarUrlSmall,
            userId: user!.id,
            userName: user!.name,
        };
    }
}

// tslint:disable-next-line:max-classes-per-file
class SectionHeader extends React.PureComponent<ISectionHeaderProps> {
    public render() {
        return (
            <Text style={styles.sectionHeader}>
                <FormattedDate
                    value={this.props.date}
                    year="numeric"
                    month="long"
                    day="numeric"
                />
            </Text>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class TrackableTitle extends React.PureComponent<ITrackableTitleProps> {
    public render() {
        return <Text style={styles.trackableTitle}>{this.props.text}</Text>;
    }
}

// tslint:disable-next-line:max-classes-per-file
class Number extends React.PureComponent<INumberProps> {
    public render() {
        return <Text style={styles.number}>{this.props.value}</Text>;
    }
}

// tslint:disable-next-line:max-classes-per-file
class UserName extends React.PureComponent<IUserNameProps> {
    public render() {
        return (
            <Text style={styles.userName} onPress={this.onPress}>
                {this.props.name}
            </Text>
        );
    }

    private onPress = () => this.props.onPress(this.props.id);
}

// tslint:disable-next-line:max-classes-per-file
class ExternalGoalReviewedActivity extends
    React.PureComponent<IExternalGoalReviewedActivityProps> {
    public render() {
        const {
            trackableTitle,
            externalUserName,
            externalUserId,
            isApprove,
            ratingDelta,
            onPressUser,
            ...restProps,
        } = this.props;
        const msgValues = {
            hasRatingDelta: ratingDelta != null,
            isApprove,
            ratingDelta: ratingDelta != null && <Number value={ratingDelta} />,
            trackableTitle: <TrackableTitle text={trackableTitle} />,
            userName: (
                <UserName
                    id={externalUserId}
                    name={externalUserName}
                    onPress={onPressUser}
                />
            ),
        };
        const iconStyle = isApprove ? styles.externalGoalReviewedIconApproved :
            styles.externalGoalReviewedIconRejected;
        return (
            <Activity
                msgId="activities.externalGoalReviewed"
                msgValues={msgValues}
                iconName={isApprove ? IconName.Approve : IconName.Reject}
                iconStyle={iconStyle}
                onPressUser={onPressUser}
                {...restProps}
            />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class GoalExpiredActivity extends
    React.PureComponent<IGoalExpiredActivityProps> {
    public render() {
        const { trackableTitle, ...restProps } = this.props;
        const msgValues = {
            trackableTitle: <TrackableTitle text={trackableTitle} />,
        };
        return (
            <Activity
                msgId="activities.goalExpired"
                msgValues={msgValues}
                iconName={IconName.Expiration}
                iconStyle={styles.goalExpiredIcon}
                {...restProps}
            />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class GoalAchievedActivity extends
    React.PureComponent<IGoalAchievedActivityProps> {
    public render() {
        const { trackableTitle, ...restProps } = this.props;
        const msgValues = {
            trackableTitle: <TrackableTitle text={trackableTitle} />,
        };
        return (
            <Activity
                msgId="activities.goalAchieved"
                msgValues={msgValues}
                iconName={IconName.ProgressMax}
                iconStyle={styles.goalAchievedIcon}
                {...restProps}
            />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class GoalRejectedActivity extends
    React.PureComponent<IGoalRejectedActivityProps> {
    public render() {
        const { trackableTitle, ...restProps } = this.props;
        const msgValues = {
            trackableTitle: <TrackableTitle text={trackableTitle} />,
        };
        return (
            <Activity
                msgId="activities.goalRejected"
                msgValues={msgValues}
                iconName={IconName.Reject}
                iconStyle={styles.goalRejectedIcon}
                {...restProps}
            />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class GoalApprovedActivity extends
    React.PureComponent<IGoalApprovedActivityProps> {
    public render() {
        const { trackableTitle, ratingDelta, ...restProps } = this.props;
        const msgValues = {
            hasRatingDelta: ratingDelta != null,
            ratingDelta: ratingDelta != null && <Number value={ratingDelta} />,
            trackableTitle: <TrackableTitle text={trackableTitle} />,
        };
        return (
            <Activity
                msgId="activities.goalApproved"
                msgValues={msgValues}
                iconName={IconName.Approve}
                iconStyle={styles.goalApprovedIcon}
                {...restProps}
            />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class GymExerciseEntryAddedActivity extends
    React.PureComponent<IGymExerciseEntryAddedActivityProps> {
    public render() {
        const {
            trackableTitle,
            setCount,
            repetitionCount,
            weight,
            ...restProps,
        } = this.props;
        const msgValues = {
            repetitionCount: <Number value={repetitionCount} />,
            setCount: <Number value={setCount} />,
            trackableTitle: <TrackableTitle text={trackableTitle} />,
            weight: <Number value={weight} />,
        };
        return (
            <Activity
                msgId="activities.gymExerciseEntryAdded"
                msgValues={msgValues}
                iconName={IconName.ProgressChange}
                {...restProps}
            />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class TrackableAddedActivity extends
    React.PureComponent<ITrackableAddedActivityProps> {
    public render() {
        const { trackableTitle, ...restProps } = this.props;
        const msgValues = {
            trackableTitle: <TrackableTitle text={trackableTitle} />,
        };
        return (
            <Activity
                msgId="activities.trackableAdded"
                msgValues={msgValues}
                iconName={IconName.New}
                iconStyle={styles.trackableAddedIcon}
                {...restProps}
            />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class CounterProgressChangedActivity extends
    React.PureComponent<ICounterProgressChangedActivityProps> {
    public render() {
        const { trackableTitle, progressDelta, ...restProps } = this.props;
        const msgValues = {
            delta: <Number value={progressDelta} />,
            trackableTitle: <TrackableTitle text={trackableTitle} />,
        };
        return (
            <Activity
                msgId="activities.counterProgressChanged"
                msgValues={msgValues}
                iconName={IconName.ProgressChange}
                {...restProps}
            />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class NumericalGoalProgressChangedActivity extends
    React.PureComponent<INumericalGoalProgressChangedActivityProps> {
    public render() {
        const { trackableTitle, progressDelta, ...restProps } = this.props;
        const msgValues = {
            delta: <Number value={progressDelta} />,
            trackableTitle: <TrackableTitle text={trackableTitle} />,
        };
        return (
            <Activity
                msgId="activities.numericalGoalProgressChanged"
                msgValues={msgValues}
                iconName={IconName.ProgressChange}
                {...restProps}
            />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class TaskGoalProgressChangedActivity extends
    React.PureComponent<ITaskGoalProgressChangedActivityProps> {
    public render() {
        const { trackableTitle, taskTitle, ...restProps } = this.props;
        const msgValues = {
            taskTitle: <Text style={styles.taskTitle}>{taskTitle}</Text>,
            trackableTitle: <TrackableTitle text={trackableTitle} />,
        };
        return (
            <Activity
                msgId="activities.taskGoalProgressChanged"
                msgValues={msgValues}
                iconName={IconName.ProgressChange}
                {...restProps}
            />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class Activity extends React.Component<IActivityProps> {
    public render() {
        const { userAvatarUrl, iconName, msgId, msgValues, iconStyle } =
            this.props;
        const userAvatar = userAvatarUrl && (
            <TouchableWithoutFeedback onPress={this.onPressUser}>
                <View style={styles.activityAvatar}>
                    <Avatar uri={userAvatarUrl} size="small" />
                </View>
            </TouchableWithoutFeedback>
        );
        return (
            <View style={styles.activity}>
                {userAvatar}
                <FormattedMessage id={msgId} values={msgValues}>
                    {this.renderMsg}
                </FormattedMessage>
                <Icon
                    name={iconName}
                    size={32}
                    style={[styles.activityIcon, iconStyle]}
                />
            </View>
        );
    }

    private renderMsg = (...parts: Array< React.ReactElement<any> >) => {
        const { userName, userId, onPressUser } = this.props;
        const userNameElement = userName && (
            <UserName
                id={userId!}
                name={`${userName} `}
                onPress={onPressUser}
            />
        );
        const msg = React.Children.map(parts, (part, i) => {
            return React.isValidElement(part) ? React.cloneElement(
                part as React.ReactElement<any>, { key: i }) : part;
        });
        return (
            <Text style={styles.activityMsg}>
                {userNameElement}
                {msg}{" "}
            </Text>
        );
    }

    private onPressUser = () => this.props.onPressUser(this.props.userId!);
}

const styles = StyleSheet.create({
    activity: {
        alignItems: "flex-start",
        flexDirection: "row",
        paddingBottom: 8,
        paddingTop: 8,
    },
    activityAvatar: {
        marginRight: 8,
    },
    activityIcon: {
        color: "#FF8A00",
        marginLeft: 8,
    },
    activityMsg: {
        flex: 1,
        flexWrap: "wrap",
        lineHeight: 32,
    },
    externalGoalReviewedIconApproved: {
        color: "#43D459",
    },
    externalGoalReviewedIconRejected: {
        color: "#ff3b30",
    },
    goalAchievedIcon: {
        color: "#43D459",
    },
    goalApprovedIcon: {
        color: "#43D459",
    },
    goalExpiredIcon: {
        color: "#888",
    },
    goalRejectedIcon: {
        color: "#ff3b30",
    },
    listContent: {
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
    },
    number: {
        fontWeight: "bold",
    },
    sectionHeader: {
        color: "#ccc",
        paddingBottom: 8,
        paddingTop: 8,
        textAlign: "center",
    },
    taskTitle: {
        fontWeight: "bold",
        textDecorationLine: "line-through",
    },
    trackableAddedIcon: {
        color: "#0076ff",
    },
    trackableTitle: {
        fontWeight: "bold",
    },
    userName: {
        color: "#888",
    },
});

export { IActivityListSection, IActivityListItemNode };
export default ActivityList;
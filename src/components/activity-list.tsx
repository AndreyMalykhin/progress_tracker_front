import Avatar from "components/avatar";
import Loader from "components/loader";
import Text from "components/text";
import { IWithRefreshProps } from "components/with-refresh";
import Audience from "models/audience";
import TrackableType from "models/trackable-type";
import Type from "models/type";
import * as React from "react";
import { FormattedDate, FormattedMessage, MessageValue } from "react-intl";
import {
    ListRenderItem,
    SectionList,
    SectionListData,
    StyleProp,
    StyleSheet,
    TextStyle,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import IconName from "utils/icon-name";
import makeLog from "utils/make-log";
import QueryStatus from "utils/query-status";

interface IActivityListProps extends IWithRefreshProps {
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
    isFirst?: boolean;
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
    trackableType: TrackableType;
}

interface ITrackableAddedActivity extends IActivity {
    trackable: {
        __typename: TrackableType;
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

const log = makeLog("activity-list");

class ActivityList extends React.PureComponent<IActivityListProps> {
    public render() {
        log.trace("render()");
        const { sections, queryStatus, isRefreshing, onEndReached, onRefresh } =
            this.props;
        const loader = queryStatus === QueryStatus.LoadingMore ? Loader : null;
        return (
            <SectionList
                windowSize={12}
                initialNumToRender={10}
                refreshing={isRefreshing}
                keyExtractor={this.getItemKey}
                renderItem={this.onRenderItem}
                renderSectionHeader={this.onRenderSectionHeader}
                sections={sections}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={loader}
                onEndReachedThreshold={0.5}
                onEndReached={onEndReached}
                onRefresh={onRefresh}
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
            return this.renderTrackableAdded(
                item as ITrackableAddedActivity, itemInfo.index);
            case Type.CounterProgressChangedActivity:
            return this.renderCounterProgressChanged(
                item as ICounterProgressChangedActivity, itemInfo.index);
            case Type.TaskGoalProgressChangedActivity:
            return this.renderTaskGoalProgressChanged(
                item as ITaskGoalProgressChangedActivity, itemInfo.index);
            case Type.GymExerciseEntryAddedActivity:
            return this.renderGymExerciseEntryAdded(
                item as IGymExerciseEntryAddedActivity, itemInfo.index);
            case Type.NumericalGoalProgressChangedActivity:
            return this.renderNumericalGoalProgressChanged(
                item as INumericalGoalProgressChangedActivity, itemInfo.index);
            case Type.GoalApprovedActivity:
            return this.renderGoalApproved(
                item as IGoalApprovedActivity, itemInfo.index);
            case Type.GoalRejectedActivity:
            return this.renderGoalRejected(
                item as IGoalRejectedActivity, itemInfo.index);
            case Type.GoalAchievedActivity:
            return this.renderGoalAchieved(
                item as IGoalAchievedActivity, itemInfo.index);
            case Type.GoalExpiredActivity:
            return this.renderGoalExpired(
                item as IGoalExpiredActivity, itemInfo.index);
            case Type.ExternalGoalReviewedActivity:
            return this.renderExternalGoalReviewed(
                item as IExternalGoalReviewedActivity, itemInfo.index);
            default:
            throw new Error("Unexpected type: " + item.__typename);
        }
    }

    private renderExternalGoalReviewed(
        item: IExternalGoalReviewedActivity, index: number,
    ) {
        const { trackable, isApprove, ratingDelta } = item;
        return (
            <ExternalGoalReviewedActivity
                externalUserId={trackable.user.id}
                externalUserName={trackable.user.name}
                isApprove={isApprove}
                trackableTitle={trackable.title}
                ratingDelta={ratingDelta}
                {...this.getBaseActivityProps(item, index)}
            />
        );
    }

    private renderGoalExpired(item: IGoalExpiredActivity, index: number) {
        const { trackable } = item;
        return (
            <GoalExpiredActivity
                trackableTitle={trackable.title}
                {...this.getBaseActivityProps(item, index)}
            />
        );
    }

    private renderGoalAchieved(item: IGoalAchievedActivity, index: number) {
        const { trackable } = item;
        return (
            <GoalAchievedActivity
                trackableTitle={trackable.title}
                {...this.getBaseActivityProps(item, index)}
            />
        );
    }

    private renderGoalRejected(item: IGoalRejectedActivity, index: number) {
        const { trackable } = item;
        return (
            <GoalRejectedActivity
                trackableTitle={trackable.title}
                {...this.getBaseActivityProps(item, index)}
            />
        );
    }

    private renderGoalApproved(item: IGoalApprovedActivity, index: number) {
        const { trackable, ratingDelta } = item;
        return (
            <GoalApprovedActivity
                trackableTitle={trackable.title}
                ratingDelta={ratingDelta}
                {...this.getBaseActivityProps(item, index)}
            />
        );
    }

    private renderNumericalGoalProgressChanged(
        item: INumericalGoalProgressChangedActivity, index: number,
    ) {
        const { trackable, delta } = item;
        return (
            <NumericalGoalProgressChangedActivity
                trackableTitle={trackable.title}
                progressDelta={delta}
                {...this.getBaseActivityProps(item, index)}
            />
        );
    }

    private renderGymExerciseEntryAdded(
        item: IGymExerciseEntryAddedActivity, index: number,
    ) {
        const { trackable, entry } = item;
        return (
            <GymExerciseEntryAddedActivity
                trackableTitle={trackable.title}
                setCount={entry.setCount}
                repetitionCount={entry.repetitionCount}
                weight={entry.weight}
                {...this.getBaseActivityProps(item, index)}
            />
        );
    }

    private renderTrackableAdded(item: ITrackableAddedActivity, index: number) {
        const { trackable } = item;
        return (
            <TrackableAddedActivity
                trackableTitle={trackable.title}
                trackableType={trackable.__typename}
                {...this.getBaseActivityProps(item, index)}
            />
        );
    }

    private renderCounterProgressChanged(
        item: ICounterProgressChangedActivity, index: number,
    ) {
        const { trackable, delta } = item;
        return (
            <CounterProgressChangedActivity
                trackableTitle={trackable.title}
                progressDelta={delta}
                {...this.getBaseActivityProps(item, index)}
            />
        );
    }

    private renderTaskGoalProgressChanged(
        item: ITaskGoalProgressChangedActivity, index: number,
    ) {
        const { trackable, task } = item;
        return (
            <TaskGoalProgressChangedActivity
                trackableTitle={trackable.title}
                taskTitle={task.title}
                {...this.getBaseActivityProps(item, index)}
            />
        );
    }

    private getBaseActivityProps(
        item: IActivity, index: number,
    ): IBaseActivityProps {
        if (this.props.audience === Audience.Me) {
            return { isFirst: !index, onPressUser: this.props.onPressUser };
        }

        const { user } = item;
        return {
            isFirst: !index,
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
            hasRatingDelta: !!ratingDelta,
            isApprove,
            ratingDelta: ratingDelta && <Number value={ratingDelta} />,
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
            hasRatingDelta: !!ratingDelta,
            ratingDelta: ratingDelta && <Number value={ratingDelta} />,
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
        const { trackableTitle, trackableType, ...restProps } = this.props;
        const msgValues = {
            trackableTitle: <TrackableTitle text={trackableTitle} />,
            trackableType,
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
        const { userAvatarUrl, iconName, msgId, msgValues, iconStyle, isFirst }
            = this.props;
        const userAvatar = userAvatarUrl && (
            <TouchableWithoutFeedback onPress={this.onPressUser}>
                <View style={styles.activityAvatar}>
                    <Avatar uri={userAvatarUrl} size="small" />
                </View>
            </TouchableWithoutFeedback>
        );
        return (
            <View style={[styles.activity, isFirst && styles.activityFirst]}>
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
    activityFirst: {
    },
    activityIcon: {
        color: "#FF8A00",
        marginLeft: 8,
    },
    activityMsg: {
        flex: 1,
        flexWrap: "wrap",
        paddingBottom: 8,
        paddingTop: 8,
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

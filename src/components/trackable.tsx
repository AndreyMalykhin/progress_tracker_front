import Button, { ButtonTitle } from "components/button";
import Card, {
    CardAvatar,
    CardBody,
    CardCommandBar,
    CardHeader,
    CardIcon,
    CardTitle,
} from "components/card";
import CheckBox from "components/check-box";
import { ICommandBarItem } from "components/command-bar";
import Image from "components/image";
import Text from "components/text";
import TouchableWithFeedback from "components/touchable-with-feedback";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import {
    LayoutRectangle,
    PanResponderGestureState,
    StyleProp,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import IconName from "utils/icon-name";

interface ITrackableProps {
    index?: number;
    id: string;
    parentId?: string;
    status: TrackableStatus;
    isProveable?: boolean;
    isProveDisabled?: boolean;
    isProving?: boolean;
    isReviewable?: boolean;
    isBatchEditMode?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
    isReorderMode?: boolean;
    isDragged?: boolean;
    isExpandable?: boolean;
    isExpanded?: boolean;
    isNoCard?: boolean;
    commands?: ICommandBarItem[];
    duration?: number;
    style?: StyleProp<ViewStyle>;
    title: string;
    iconName?: string;
    rating?: number;
    approveCount?: number;
    rejectCount?: number;
    proofPhotoUrl?: string;
    userId?: string;
    userAvatarUrl?: string;
    userName?: string;
    onExpandChange?: (id: string, isExpanded: boolean) => void;
    onProve?: (id: string) => void;
    onGetLayoutRef?: () => View|undefined;
    onSelectChange?: (id: string, isSelected: boolean) => void;
    onLongPress?: (id: string, parentId?: string) => void;
    onPressOut?: (id: string) => void;
    onLayout?: (id: string, layout?: LayoutRectangle) => void;
    onPressUser?: (id: string) => void;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
}

interface IReviewControlsProps {
    onApprove: () => void;
    onReject: () => void;
}

interface IAchievementDetailsProps {
    rejectCount?: number;
    approveCount?: number;
    rating?: number;
}

interface IStatusProps {
    status: TrackableStatus;
    duration: number;
}

interface IExpandButtonProps {
    isExpanded?: boolean;
    isDisabled?: boolean;
    onExpandChange: (isExpanded: boolean) => void;
}

interface IProveButtonProps {
    isDisabled?: boolean;
    isLoading?: boolean;
    onPress?: () => void;
}

const millisecondsInDay = 86400 * 1000;

class Trackable extends React.Component<ITrackableProps> {
    private card?: View;

    public render() {
        const {
            children,
            title,
            status,
            iconName,
            isBatchEditMode,
            isDragged,
            isExpandable,
            commands,
            style,
            duration,
            proofPhotoUrl,
            isProveable,
            isReviewable,
            isNoCard,
            userName,
            userAvatarUrl,
            onLayout,
            onLongPress,
            onPressOut,
        } = this.props;
        const icon = iconName && <CardIcon name={iconName} component={Icon} />;
        const statusElement =
            duration != null && <Status duration={duration} status={status} />;
        const newContainerStyle = [
            styles.container,
            style,
            isDragged && styles.containerDragged,
        ];
        return (
            <View style={newContainerStyle as any}>
                {isBatchEditMode && this.renderCheckBox()}
                <Card
                    onRef={this.onCardRef}
                    onLongPress={onLongPress && this.onLongPress}
                    onPressIn={onLayout && this.onPressIn}
                    onPressOut={onPressOut && this.onPressOut}
                    style={[styles.card, isNoCard && styles.cardAbsent]}
                >
                    {(userName || userAvatarUrl) && this.renderUser()}
                    <CardHeader style={isNoCard && styles.cardHeaderAbsent}>
                        {icon}
                        <CardTitle text={title} />
                        {commands && commands.length && this.renderCmdBar()}
                    </CardHeader>
                    {proofPhotoUrl && this.renderProofPhoto()}
                    <CardBody style={isNoCard && styles.cardBodyAbsent}>
                        {children}
                        {isExpandable && this.renderExpandBtn()}
                        {this.renderAchievementDetails()}
                        {isProveable && this.renderProveBtn()}
                        {isReviewable && this.renderReviewControls()}
                        {statusElement}
                    </CardBody>
                </Card>
            </View>
        );
    }

    public componentDidUpdate(prevProps: ITrackableProps) {
        const { index, parentId, isReorderMode } = this.props;

        if (index !== prevProps.index
            || (parentId !== prevProps.parentId && !parentId)
            || (isReorderMode !== prevProps.isReorderMode && isReorderMode)
        ) {
            this.calculateLayout();
        }
    }

    private renderUser() {
        const { userName, userAvatarUrl } = this.props;
        const nameElement = userName && (
            <CardTitle isPrimary={true} text={userName} />
        );
        const avatar = userAvatarUrl && <CardAvatar uri={userAvatarUrl} />;
        return (
            <TouchableWithFeedback onPress={this.onPressUser}>
                <CardHeader isPrimary={true}>
                    {avatar}
                    {nameElement}
                </CardHeader>
            </TouchableWithFeedback>
        );
    }

    private renderReviewControls() {
        return (
            <ReviewControls
                onApprove={this.onApprove}
                onReject={this.onReject}
            />
        );
    }

    private renderProofPhoto() {
        return (
            <Image
                style={styles.proofPhoto}
                resizeMode="cover"
                source={{ uri: this.props.proofPhotoUrl }}
            />
        );
    }

    private renderAchievementDetails() {
        const { rating, approveCount, rejectCount} = this.props;

        if (rating == null && approveCount == null && rejectCount == null) {
            return null;
        }

        return (
            <AchievementDetails
                approveCount={approveCount}
                rejectCount={rejectCount}
                rating={rating}
            />
        );
    }

    private renderCmdBar() {
        const { commands, isDisabled, isBatchEditMode } = this.props;
        return (
            <CardCommandBar
                items={commands!}
                isDisabled={isDisabled || isBatchEditMode}
                titleMsgId="common.chooseAction"
            />
        );
    }

    private renderCheckBox() {
        const { isSelected, isDisabled, onSelectChange } = this.props;
        return (
            <CheckBox
                isChecked={isSelected}
                isDisabled={isDisabled}
                style={styles.checkBox}
                onPress={onSelectChange && this.onSelectChange}
            />
        );
    }

    private renderExpandBtn() {
        const { isBatchEditMode, isDisabled, isExpanded } = this.props;
        return (
            <ExpandButton
                isDisabled={isBatchEditMode || isDisabled}
                isExpanded={isExpanded}
                onExpandChange={this.onExpandChange}
            />
        );
    }

    private renderProveBtn() {
        const { isDisabled, isProving, isProveDisabled, onProve } = this.props;
        return (
            <ProveButton
                isDisabled={isDisabled || isProveDisabled}
                isLoading={isProving}
                onPress={onProve && this.onProve}
            />
        );
    }

    private onPressUser = () => this.props.onPressUser!(this.props.userId!);

    private onProve = () => this.props.onProve!(this.props.id);

    private onLongPress = () =>
        this.props.onLongPress!(this.props.id, this.props.parentId)

    private onPressIn = () => this.calculateLayout();

    private onPressOut = () => this.props.onPressOut!(this.props.id);

    private onExpandChange = () => {
        const { onExpandChange, id, isExpanded } = this.props;
        onExpandChange!(id, !isExpanded);
    }

    private onSelectChange = (isSelected: boolean) => {
        this.props.onSelectChange!(this.props.id, isSelected);
    }

    private onCardRef = (ref?: View) => this.card = ref;

    private calculateLayout() {
        requestAnimationFrame(() => {
            const { onGetLayoutRef, onLayout } = this.props;
            const container = onGetLayoutRef ? onGetLayoutRef() : this.card;

            if (!container) {
                return;
            }

            container.measure((x, y, width, height, pageX, pageY) => {
                this.props.onLayout!(
                    this.props.id, { x: pageX, y: pageY, width, height });
            });
        });
    }

    private onApprove = () => this.props.onApprove!(this.props.id);

    private onReject = () => this.props.onReject!(this.props.id);
}

// tslint:disable-next-line:max-classes-per-file
class ReviewControls extends React.PureComponent<IReviewControlsProps> {
    public render() {
        const { onApprove, onReject } = this.props;
        return (
            <View style={styles.reviewControls}>
                <Button onPress={onApprove}>
                    <ButtonTitle
                        style={styles.approveBtnTitle}
                        msgId="trackable.approve"
                    />
                </Button>
                <Button onPress={onReject}>
                    <ButtonTitle
                        dangerous={true}
                        style={styles.rejectBtnTitle}
                        msgId="trackable.reject"
                    />
                </Button>
            </View>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class AchievementDetails extends React.PureComponent<IAchievementDetailsProps> {
    public render() {
        const {rating, approveCount, rejectCount} = this.props;
        return (
            <View style={styles.achievementDetails}>
                {this.renderItem("star-circle", rating)}
                {this.renderItem("check", approveCount)}
                {this.renderItem("close", rejectCount)}
            </View>
        );
    }

    private renderItem(iconName: string, value?: number) {
        if (value == null) {
            return null;
        }

        return (
            <View style={styles.achievementDetailsItem}>
                <Icon
                    style={styles.achievementDetailsItemIcon}
                    name={iconName}
                    size={32}
                />
                <Text style={styles.achievementDetailsItemValue}>{value}</Text>
            </View>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class ExpandButton extends React.PureComponent<IExpandButtonProps> {
    public render() {
        const { isExpanded, isDisabled } = this.props;
        const msgId = isExpanded ? "common.less" : "common.more";
        return (
            <Button
                style={styles.expandBtn}
                disabled={isDisabled}
                onPress={this.onExpandChange}
            >
                <ButtonTitle disabled={isDisabled} msgId={msgId} />
            </Button>
        );
    }

    private onExpandChange = () => {
        const { onExpandChange, isExpanded } = this.props;
        onExpandChange(!isExpanded);
    }
}

// tslint:disable-next-line:max-classes-per-file
class ProveButton extends React.PureComponent<IProveButtonProps> {
    public render() {
        const { isDisabled, isLoading, onPress } = this.props;

        return (
            <Button
                style={styles.proveBtn}
                disabled={isDisabled}
                loading={isLoading}
                onPress={onPress}
            >
                <ButtonTitle disabled={isDisabled} msgId="trackable.prove" />
            </Button>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class Status extends React.PureComponent<IStatusProps> {
    public render() {
        const { status, duration } = this.props;
        let msgId;

        switch (status) {
            case TrackableStatus.Expired:
            msgId = "trackable.expirationPeriod";
            break;
            case TrackableStatus.Active:
            msgId = "trackable.activePeriod";
            break;
            default:
            msgId = "trackable.achievementPeriod";
        }

        const period = Math.floor(duration! / millisecondsInDay);
        return (
            <View style={styles.status}>
                <Icon
                    style={styles.statusIcon}
                    name={IconName.Date}
                    size={16}
                />
                <Text style={styles.statusMsg}>
                    <FormattedMessage id={msgId} values={{ period }} />
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    achievementDetails: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingBottom: 8,
        paddingTop: 16,
    },
    achievementDetailsItem: {
        alignItems: "flex-start",
        flexDirection: "row",
    },
    achievementDetailsItemIcon: {
        lineHeight: 32,
        marginRight: 8,
    },
    achievementDetailsItemValue: {
        lineHeight: 32,
    },
    approveBtnTitle: {
        color: "#0076ff",
    },
    card: {
        flex: 1,
    },
    cardAbsent: {
        borderWidth: 0,
    },
    cardBodyAbsent: {
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
    },
    cardHeaderAbsent: {
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
    },
    checkBox: {
        alignSelf: "center",
        paddingRight: 8,
    },
    container: {
        flexDirection: "row",
        marginBottom: 8,
    },
    containerDragged: {
        opacity: 0,
    },
    expandBtn: {
        alignSelf: "center",
    },
    proofPhoto: {
        height: 256,
    },
    proveBtn: {
        alignSelf: "center",
    },
    rejectBtnTitle: {},
    reviewControls: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 8,
    },
    status: {
        alignItems: "flex-start",
        flexDirection: "row",
    },
    statusIcon: {
        color: "#888",
        lineHeight: 32,
        marginRight: 8,
    },
    statusMsg: {
        color: "#888",
        fontSize: 10,
        lineHeight: 32,
    },
});

export { ITrackableProps };
export default Trackable;

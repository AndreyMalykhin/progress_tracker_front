import Button, { ButtonIcon, ButtonTitle } from "components/button";
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
import {
    CardStyle,
    Color,
    Gap,
    IconStyle,
    rem,
    ShadeColor,
    TouchableStyle,
    TypographyStyle,
} from "components/common-styles";
import Icon from "components/icon";
import Image from "components/image";
import Text from "components/text";
import TouchableWithFeedback from "components/touchable-with-feedback";
import { CalloutText, FootnoteText } from "components/typography";
import ReviewStatus from "models/review-status";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import {
    LayoutRectangle,
    PanResponderGestureState,
    StyleProp,
    StyleSheet,
    TextStyle,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from "react-native";
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
    isLast?: boolean;
    isFirst?: boolean;
    isNested?: boolean;
    myReviewStatus?: ReviewStatus;
    commands?: ICommandBarItem[];
    statusDuration?: number;
    style?: StyleProp<ViewStyle>;
    cardHeaderStyle?: StyleProp<ViewStyle>;
    cardHeaderTitleStyle?: StyleProp<TextStyle>;
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
    onGetLayoutRef?: () => View | undefined;
    onSelectChange?: (id: string, isSelected: boolean) => void;
    onLongPress?: (id: string, parentId?: string) => void;
    onPressOut?: (id: string) => void;
    onLayout?: (id: string, layout?: LayoutRectangle) => void;
    onPressUser?: (id: string) => void;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
}

interface IAchievementDetailsProps {
    reviewStatus?: ReviewStatus;
    rejectCount?: number;
    approveCount?: number;
    rating?: number;
    onApprove?: () => void;
    onReject?: () => void;
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
            cardHeaderStyle,
            cardHeaderTitleStyle,
            statusDuration,
            proofPhotoUrl,
            isProveable,
            isReviewable,
            isLast,
            isFirst,
            isNested,
            userName,
            userAvatarUrl,
            parentId,
            onLayout,
            onLongPress,
            onPressOut,
        } = this.props;
        const icon = iconName && <CardIcon name={iconName} component={Icon} />;
        const statusElement = statusDuration != null
            && <Status duration={statusDuration} status={status} />;
        const newContainerStyle = [
            styles.container,
            style,
            isFirst && styles.containerFirst,
            isLast && styles.containerLast,
            isNested && styles.containerNested,
            isDragged && styles.containerDragged,
        ];
        const cardBodyStyle = [
            isNested && styles.cardBodyNested,
            isLast && styles.cardBodyLast,
        ];
        return (
            <View style={newContainerStyle as any}>
                {isBatchEditMode && this.renderCheckBox()}
                <Card
                    onRef={this.onCardRef}
                    onLongPress={onLongPress && this.onLongPress}
                    onPressIn={onLayout && this.onPressIn}
                    onPressOut={onPressOut && this.onPressOut}
                    style={styles.card}
                >
                    {(userName || userAvatarUrl) && this.renderUser()}
                    <CardHeader style={cardHeaderStyle}>
                        {icon}
                        <CardTitle style={cardHeaderTitleStyle} text={title} />
                        {commands && commands.length && this.renderCmdBar()}
                    </CardHeader>
                    {proofPhotoUrl && this.renderProofPhoto()}
                    <CardBody style={cardBodyStyle as any}>
                        {children}
                        {isExpandable && this.renderExpandBtn()}
                        {this.renderAchievementDetails()}
                        {isProveable && this.renderProveBtn()}
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
        const {
            rating,
            approveCount,
            rejectCount,
            isReviewable,
            myReviewStatus,
        } = this.props;

        if (rating == null && approveCount == null && rejectCount == null) {
            return null;
        }

        return (
            <AchievementDetails
                approveCount={approveCount}
                rejectCount={rejectCount}
                rating={rating}
                reviewStatus={myReviewStatus}
                onApprove={isReviewable ? this.onApprove : undefined}
                onReject={isReviewable ? this.onReject : undefined}
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
class AchievementDetails extends React.PureComponent<IAchievementDetailsProps> {
    public render() {
        const {
            rating,
            approveCount,
            rejectCount,
            reviewStatus,
            onApprove,
            onReject,
        } = this.props;
        const ratingElement = this.renderItem(
            IconName.Rating, styles.achievementDetailsItemIconRating, rating);
        const approvesElement = this.renderItem(
            IconName.Approve,
            styles.achievementDetailsItemIconApproves,
            approveCount,
            onApprove,
            reviewStatus === ReviewStatus.Approved,
        );
        const rejectsElement = this.renderItem(
            IconName.Reject,
            styles.achievementDetailsItemIconRejects,
            rejectCount,
            onReject,
            reviewStatus === ReviewStatus.Rejected,
        );
        return (
            <View style={styles.achievementDetails}>
                {ratingElement}
                {approvesElement}
                {rejectsElement}
            </View>
        );
    }

    private renderItem(
        iconName: IconName,
        iconStyle: TextStyle,
        value?: number,
        onPress?: () => void,
        isActive?: boolean,
    ) {
        if (value == null) {
            return null;
        }

        return (
            <View style={styles.achievementDetailsItem}>
                <Button onPress={onPress} disabled={!onPress}>
                    <ButtonIcon
                        active={isActive}
                        component={Icon}
                        style={[styles.achievementDetailsItemIcon, iconStyle]}
                        name={iconName}
                    />
                </Button>
                <CalloutText style={styles.achievementDetailsItemValue}>
                    {value}
                </CalloutText>
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
                <ButtonTitle
                    primary={true}
                    disabled={isDisabled}
                    msgId="trackable.prove"
                />
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
            case TrackableStatus.PendingProof:
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
                    size={TypographyStyle.footnote.lineHeight}
                />
                <FootnoteText style={styles.statusMsg}>
                    <FormattedMessage id={msgId} values={{ period }} />
                </FootnoteText>
            </View>
        );
    }
}

const trackableMargin = Gap.double;

const styles = StyleSheet.create({
    achievementDetails: {
        flexDirection: "row",
    },
    achievementDetailsItem: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
    },
    achievementDetailsItemIcon: {
        color: IconStyle.color,
    },
    achievementDetailsItemIconApproves: {},
    achievementDetailsItemIconRating: {},
    achievementDetailsItemIconRejects: {},
    achievementDetailsItemValue: {
        lineHeight: TouchableStyle.minHeight,
    },
    card: {
        flex: 1,
    },
    cardBodyLast: {
        borderBottomWidth: 0,
    },
    cardBodyNested: {
        borderBottomWidth: 1,
        borderColor: ShadeColor.light2,
        marginLeft: Gap.single,
        marginRight: Gap.single,
        paddingLeft: 0,
        paddingRight: 0,
    },
    checkBox: {
        alignSelf: "flex-start",
        paddingLeft: Gap.single,
        paddingTop: Gap.single,
    },
    container: {
        backgroundColor: CardStyle.backgroundColor,
        flexDirection: "row",
        marginBottom: trackableMargin,
    },
    containerDragged: {
        opacity: 0,
    },
    containerFirst: {
        marginTop: trackableMargin,
    },
    containerLast: {
        marginBottom: trackableMargin,
    },
    containerNested: {
        marginBottom: 0,
        marginTop: 0,
    },
    expandBtn: {
        alignSelf: "center",
    },
    proofPhoto: {
        height: 256,
        marginBottom: Gap.single,
    },
    proveBtn: {
        alignSelf: "center",
    },
    status: {
        alignItems: "flex-start",
        flexDirection: "row",
        paddingTop: Gap.single,
    },
    statusIcon: {
        color: Color.grayDark,
        marginRight: Gap.single,
    },
    statusMsg: {
        color: Color.grayDark,
    },
});

export { ITrackableProps, trackableMargin };
export default Trackable;

import Button, { ButtonTitle } from "components/button";
import Card, {
    CardBody,
    CardCommandBar,
    CardHeader,
    CardIcon,
    CardTitle,
} from "components/card";
import CheckBox from "components/check-box";
import { ICommandBarItem } from "components/command-bar";
import ITrackableBaseProps from "components/trackable-base-props";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import {
    Image,
    LayoutRectangle,
    PanResponderGestureState,
    StyleProp,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface ITrackableProps extends ITrackableBaseProps {
    title: string;
    iconName?: string;
    isExpandable?: boolean;
    isExpanded?: boolean;
    cardStyle?: StyleProp<ViewStyle>;
    cardHeaderStyle?: StyleProp<ViewStyle>;
    cardBodyStyle?: StyleProp<ViewStyle>;
    style?: StyleProp<ViewStyle>;
    rating?: number;
    approveCount?: number;
    rejectCount?: number;
    proofPhotoUrl?: string;
    onExpandChange?: (id: string, isExpanded: boolean) => void;
    onProve?: (id: string) => void;
    onGetLayoutRef?: () => View|undefined;
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
            cardStyle,
            cardHeaderStyle,
            cardBodyStyle,
            style,
            duration,
            proofPhotoUrl,
            onLayout,
            onLongPress,
            onPressOut,
        } = this.props;
        const proveButton =
            status === TrackableStatus.PendingProof && this.renderProveBtn();
        const icon = iconName && <CardIcon name={iconName} component={Icon} />;
        const statusElement =
            duration != null && <Status duration={duration} status={status} />;
        const baseStyle =
            isDragged ? containerDraggedStyle : styles.container;
        return (
            <View style={[baseStyle, style]}>
                {isBatchEditMode && this.renderCheckBox()}
                <Card
                    onRef={this.onCardRef}
                    onLongPress={onLongPress && this.onLongPress}
                    onPressIn={onLayout && this.onPressIn}
                    onPressOut={onPressOut && this.onPressOut}
                    style={([styles.card, cardStyle])}
                >
                    <CardHeader style={cardHeaderStyle}>
                        {icon}
                        <CardTitle text={title} />
                        {commands && commands.length && this.renderCmdBar()}
                    </CardHeader>
                    {proofPhotoUrl && this.renderProofPhoto()}
                    <CardBody style={cardBodyStyle}>
                        {children}
                        {isExpandable && this.renderExpandBtn()}
                        {this.renderAchievementDetails()}
                        {statusElement}
                        {proveButton}
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
        const { isDisabled, onProve } = this.props;
        return (
            <ProveButton
                isDisabled={isDisabled}
                onPress={onProve && this.onProve}
            />
        );
    }

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
        const { onGetLayoutRef, onLayout } = this.props;
        const container = onGetLayoutRef ? onGetLayoutRef() : this.card;

        if (!container) {
            return;
        }

        requestAnimationFrame(() => {
            container.measure((x, y, width, height, pageX, pageY) => {
                this.props.onLayout!(
                    this.props.id, { x: pageX, y: pageY, width, height });
            });
        });
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
        const { isDisabled, onPress } = this.props;

        return (
            <Button
                style={styles.proveBtn}
                disabled={isDisabled}
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
                <Icon style={styles.statusIcon} name="clock" size={16} />
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
    card: {
        backgroundColor: "#fff",
        flex: 1,
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

const containerDraggedStyle = [styles.container, styles.containerDragged];

export { ITrackableProps };
export default Trackable;

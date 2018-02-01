import Button, { ButtonTitle } from "components/button";
import Card, {
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
import {
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
    style?: StyleProp<ViewStyle>;
    onExpandChange?: (id: string, isExpanded: boolean) => void;
    onProve?: (id: string) => void;
    onGetLayoutRef?: () => View|undefined;
}

interface IExpandButtonProps {
    isExpanded?: boolean;
    isDisabled?: boolean;
    onExpandChange: (isExpanded: boolean) => void;
}

interface IProveButtonProps {
    isDisabled?: boolean;
    onPress: () => void;
}

class Trackable extends React.Component<ITrackableProps> {
    private card?: View;

    public render() {
        const {
            index,
            children,
            title,
            id,
            status,
            iconName,
            isBatchEditMode,
            isSelected,
            isDisabled,
            isDragged,
            isExpandable,
            isExpanded,
            commands,
            cardStyle,
            style,
            onSelectChange,
        } = this.props;
        let checkBox;

        if (isBatchEditMode) {
            checkBox = (
                <CheckBox
                    isChecked={isSelected}
                    isDisabled={isDisabled}
                    style={styles.checkBox}
                    onPress={this.onSelectChange}
                />
            );
        }

        let expandButton;

        if (isExpandable) {
            expandButton = (
                <ExpandButton
                    isDisabled={isBatchEditMode || isDisabled}
                    isExpanded={isExpanded}
                    onExpandChange={this.onExpandChange}
                />
            );
        }

        let proveButton;

        if (status === TrackableStatus.PendingProof) {
            proveButton = (
                <ProveButton isDisabled={isDisabled} onPress={this.onProve} />
            );
        }

        const icon = iconName && <CardIcon name={iconName} component={Icon} />;
        const baseStyle =
            isDragged ? containerDraggedStyle : styles.container;
        return (
            <View style={[baseStyle, style]}>
                {checkBox}
                <Card
                    onRef={this.onCardRef}
                    onLongPress={this.onLongPress}
                    onPressIn={this.onPressIn}
                    onPressOut={this.onPressOut}
                    style={([styles.card, cardStyle])}
                >
                    <CardHeader>
                        {icon}
                        <CardTitle text={title} />
                        <CardCommandBar
                            items={commands}
                            isDisabled={isDisabled || isBatchEditMode}
                            titleMsgId="common.chooseAction"
                        />
                    </CardHeader>
                    {children}
                    {expandButton}
                    {proveButton}
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

    private onProve = () => this.props.onProve!(this.props.id);

    private onLongPress = () =>
        this.props.onLongPress(this.props.id, this.props.parentId)

    private onPressIn = () => this.calculateLayout();

    private onPressOut = () => this.props.onPressOut(this.props.id);

    private onExpandChange = () => {
        const { onExpandChange, id, isExpanded } = this.props;
        onExpandChange!(id, !isExpanded);
    }

    private onSelectChange = (isSelected: boolean) => {
        this.props.onSelectChange(this.props.id, isSelected);
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
                this.props.onLayout(
                    this.props.id, { x: pageX, y: pageY, width, height });
            });
        });
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

const styles = StyleSheet.create({
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
        marginVertical: 8,
    },
    containerDragged: {
        opacity: 0,
    },
    expandBtn: {
        alignSelf: "center",
    },
    proveBtn: {
        alignSelf: "center",
    },
});

const containerDraggedStyle = [styles.container, styles.containerDragged];

export { ITrackableProps };
export default Trackable;

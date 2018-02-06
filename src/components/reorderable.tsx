import { throttle } from "lodash";
import * as React from "react";
import {
    Animated,
    GestureResponderEvent,
    LayoutChangeEvent,
    LayoutRectangle,
    PanResponder,
    PanResponderGestureState,
    PanResponderInstance,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
    ViewToken,
} from "react-native";

interface IReorderableProps {
    isActive?: boolean;
    placeholderStyle?: StyleProp<ViewStyle>;
    onStartReorder: () => void;
    onReorder: (sourceId: string, destinationId: string) => void;
    onEndReorder: () => void;
    onGetItemLayout: (id: string) => LayoutRectangle|undefined;
    onGetDraggedItemId: () => string;
    onGetVisibleItemIds: () => string[];
}

class Reorderable extends React.Component<IReorderableProps> {
    private pan = new Animated.ValueXY();
    private panResponder: PanResponderInstance;
    private draggedItemId?: string;
    private draggedItemLayout?: LayoutRectangle;
    private x: number;
    private y: number;
    private height: number;
    private container?: View;
    private prevDropTargetId?: string;

    public constructor(props: IReorderableProps, context: any) {
        super(props, context);
        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
            onPanResponderGrant: this.onPanResponderGrant,
            onPanResponderMove: this.onPanResponderMove,
            onPanResponderRelease: this.onPanResponderRelease,
            onPanResponderTerminate: this.onPanResponderTerminate,
        });
        this.tryReorder = throttle(this.tryReorder, 256);
    }

    public render() {
        const { children, isActive } = this.props;
        return (
            <View
                style={styles.container}
                ref={this.onContainerRef as any}
                onLayout={this.onLayout}
                {...this.panResponder.panHandlers}
            >
                {children}
                {isActive && this.renderPlaceholder()}
            </View>
        );
    }

    public componentWillReceiveProps(nextProps: IReorderableProps) {
        const { isActive, onGetItemLayout, onGetDraggedItemId } = this.props;

        if (nextProps.isActive !== isActive && nextProps.isActive) {
            this.pan.setValue({ x: 0, y: 0 });
            this.draggedItemId = onGetDraggedItemId();
            this.draggedItemLayout = onGetItemLayout(this.draggedItemId);
        }
    }

    private renderPlaceholder() {
        const { placeholderStyle } = this.props;
        const { x, y, width, height } = this.draggedItemLayout!;
        const style = {
            height,
            left: x - this.x,
            top: y - this.y,
            transform: this.pan.getTranslateTransform(),
            width,
        };
        return (
            <Animated.View
                style={[styles.placeholder, placeholderStyle, style]}
            />
        );
    }

    private onPanResponderRelease = () => this.props.onEndReorder();

    private onPanResponderTerminate = () => this.props.onEndReorder();

    private onPanResponderMove = (
        evt: GestureResponderEvent, gestureState: PanResponderGestureState,
    ) => {
        this.pan.setValue({ x: 0, y: gestureState.dy });
        this.tryReorder(gestureState);
    }

    private tryReorder = (gestureState: PanResponderGestureState) => {
        const dropTargetId = this.getDropTargetId(gestureState);

        if (dropTargetId && dropTargetId !== this.prevDropTargetId) {
            this.props.onReorder(this.draggedItemId!, dropTargetId);
        }

        this.prevDropTargetId = dropTargetId;
    }

    private onMoveShouldSetPanResponder = () => !!this.props.isActive;

    private onPanResponderGrant = () => this.props.onStartReorder();

    private onContainerRef = (ref?: View) => this.container = ref;

    private onLayout = (evt: LayoutChangeEvent) => {
        this.container!.measure((x, y, width, height, pageX, pageY) => {
            this.x = pageX;
            this.y = pageY;
            this.height = height;
        });
    }

    private getDropTargetId(gestureState: PanResponderGestureState) {
        const { dy } = gestureState;
        const { onGetVisibleItemIds, onGetItemLayout } = this.props;

        for (const itemId of onGetVisibleItemIds()) {
            if (itemId === this.draggedItemId) {
                continue;
            }

            const itemLayout = onGetItemLayout(itemId);

            if (!itemLayout) {
                continue;
            }

            const areItemsIntersect =
                this.areItemsIntersect(this.draggedItemLayout!, itemLayout, dy);

            if (areItemsIntersect) {
                return itemId;
            }
        }

        return undefined;
    }

    private areItemsIntersect(
        sourceLayout: LayoutRectangle,
        destinationLayout: LayoutRectangle,
        dy: number,
    ) {
        const { y, height } = sourceLayout;
        return !(y + dy > destinationLayout.y + destinationLayout.height
            || y + height + dy < destinationLayout.y);
    }
}

const styles = StyleSheet.create({
    container: {},
    placeholder: {
        backgroundColor: "#000",
        position: "absolute",
    },
});

export default Reorderable;

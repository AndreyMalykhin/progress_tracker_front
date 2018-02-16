import Aggregate from "components/aggregate";
import { ICommandBarItem } from "components/command-bar";
import Counter from "components/counter";
import EmptyList from "components/empty-list";
import GymExercise, {
    IGymExerciseEntry,
    IGymExerciseItem,
} from "components/gym-exercise";
import {
    IGymExerciseEntryPopupResult,
} from "components/gym-exercise-entry-popup";
import GymExerciseEntryPopupContainer from "components/gym-exercise-entry-popup-container";
import Loader from "components/loader";
import NumericalEntryPopupContainer from "components/numerical-entry-popup-container";
import NumericalGoal from "components/numerical-goal";
import Reorderable from "components/reorderable";
import TaskGoal, { ITask } from "components/task-goal";
import ToastList, { IToastListItem } from "components/toast-list";
import ProgressDisplayMode from "models/progress-display-mode";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import { ReactElement, ReactNode } from "react";
import * as React from "react";
import {
    Alert,
    FlatList,
    FlatListProperties,
    LayoutAnimation,
    LayoutRectangle,
    ListRenderItemInfo,
    NativeScrollEvent,
    NativeSyntheticEvent,
    PanResponderGestureState,
    StyleSheet,
    Text,
    View,
    ViewToken,
} from "react-native";
import DragStatus from "utils/drag-status";
import QueryStatus from "utils/query-status";

interface IVisibleItemsChangeInfo {
    viewableItems: ViewToken[];
    changed: ViewToken[];
}

interface IBaseNode {
    __typename: Type;
    id: string;
    order: number;
    status: TrackableStatus;
    statusChangeDate?: number;
    isPublic: boolean;
    creationDate: number;
    parent?: {
        id: string;
    };
}

interface IPrimitiveNode extends IBaseNode {
    iconName: string;
    title: string;
}

interface ICounter extends IPrimitiveNode {
    progress: number;
}

interface IGymExercise extends IPrimitiveNode {
    entries: IGymExerciseEntry[];
}

interface IAggregate extends IBaseNode {
    progress: number;
    maxTotalProgress?: number;
    children: Array<ITaskGoal|ICounter|INumericalGoal>;
}

interface IGoalNode extends IPrimitiveNode {
    progress: number;
    maxProgress: number;
    progressDisplayMode: ProgressDisplayMode;
}

type INumericalGoal = IGoalNode;

interface ITaskGoal extends IGoalNode {
    tasks: ITask[];
}

type IActiveTrackableListItemNode =
    IAggregate|ITaskGoal|INumericalGoal|ICounter|IGymExercise;

interface IActiveTrackableListItem {
    cursor: number;
    node: IActiveTrackableListItemNode;
}

interface IActiveTrackableListItemMeta {
    isSelected?: boolean;
    isExpanded?: boolean;
    isDisabled?: boolean;
    isProving?: boolean;
    dragStatus?: DragStatus;
}

interface IActiveTrackableListItemsMeta {
    [id: string]: IActiveTrackableListItemMeta;
}

interface IExtraData {
    queryStatus: QueryStatus;
    isAggregationMode?: boolean;
    isReorderMode?: boolean;
    itemsMeta: IActiveTrackableListItemsMeta;
}

interface IActiveTrackableListProps extends IExtraData {
    items: IActiveTrackableListItem[];
    isNumericalEntryPopupOpen?: boolean;
    isGymExerciseEntryPopupOpen?: boolean;
    toasts: IToastListItem[];
    onNumericalEntryPopupClose: (entry?: number) => void;
    onGymExerciseEntryPopupClose: (entry?: IGymExerciseEntryPopupResult) =>
        void;
    onProveItem: (id: string) => void;
    onSetTaskDone: (taskId: string, isDone: boolean) => void;
    onGetAggregateCommands: (id: string) => ICommandBarItem[]|undefined;
    onGetCounterCommands: (id: string, isAggregated: boolean) =>
        ICommandBarItem[]|undefined;
    onGetGymExerciseItems: (
        id: string,
        entries: IGymExerciseEntry[],
        isExpanded: boolean,
    ) => IGymExerciseItem[];
    onGetGymExerciseCommands: (id: string) => ICommandBarItem[]|undefined;
    onGetNumericalGoalCommands: (
        id: string,
        isAggregated: boolean,
        status: TrackableStatus,
    ) => ICommandBarItem[]|undefined;
    onGetTaskGoalCommands: (
        id: string,
        isAggregated: boolean,
        status: TrackableStatus,
    ) => ICommandBarItem[]|undefined;
    onEndReached?: () => void;
    onToggleItemSelect: (id: string, isSelected: boolean) => void;
    onToggleItemExpand: (id: string, isExpanded: boolean) => void;
    onGetVisibleTaskCount: (isExpanded: boolean, taskCount: number) => number;
    onIsTaskGoalExpandable: (taskCount: number) => boolean;
    onIsGymExerciseExpandable: (items: IGymExerciseItem[]) => boolean;
    onReorderItem: (sourceId: string, destinationId: string) => void;
    onStartReorderItem: () => void;
    onEndReorderItem: () => void;
    onItemLayout: (id: string, layout?: LayoutRectangle) => void;
    onGetItemLayout: (id: string) => LayoutRectangle|undefined;
    onLongPressItem: (id: string, parentId?: string) => void;
    onPressOutItem: (id: string) => void;
    onVisibleItemsChange: (info: IVisibleItemsChangeInfo) => void;
    onGetVisibleItemIds: () => string[];
    onGetDraggedItemId: () => string;
    onCloseToast: (index: number) => void;
    onIsItemProveable: (status: TrackableStatus) => boolean;
}

class ActiveTrackableList extends
    React.Component<IActiveTrackableListProps> {
    private extraData = {} as IExtraData;

    public constructor(props: IActiveTrackableListProps, context: any) {
        super(props, context);
        this.initExtraData(props);
    }

    public render() {
        const {
            isNumericalEntryPopupOpen,
            isGymExerciseEntryPopupOpen,
            items,
            itemsMeta,
            queryStatus,
            isReorderMode,
            toasts,
            onNumericalEntryPopupClose,
            onGymExerciseEntryPopupClose,
            onEndReached,
            onReorderItem,
            onStartReorderItem,
            onEndReorderItem,
            onGetItemLayout,
            onVisibleItemsChange,
            onGetVisibleItemIds,
            onGetDraggedItemId,
            onCloseToast,
        } = this.props;
        const loader = queryStatus === QueryStatus.LoadingMore ? Loader : null;
        const numericalEntryPopup = isNumericalEntryPopupOpen && (
            <NumericalEntryPopupContainer
                onClose={onNumericalEntryPopupClose}
            />
        );
        const gymExerciseEntryPopup = isGymExerciseEntryPopupOpen && (
            <GymExerciseEntryPopupContainer
                onClose={onGymExerciseEntryPopupClose}
            />
        );
        return (
            <View style={styles.container}>
                <Reorderable
                    isActive={isReorderMode}
                    placeholderStyle={styles.reorderablePlaceholder}
                    onReorder={onReorderItem}
                    onGetItemLayout={onGetItemLayout}
                    onGetDraggedItemId={onGetDraggedItemId}
                    onGetVisibleItemIds={onGetVisibleItemIds}
                    onStartReorder={onStartReorderItem}
                    onEndReorder={onEndReorderItem}
                >
                    <FlatList
                        windowSize={4}
                        initialNumToRender={4}
                        scrollEnabled={!isReorderMode}
                        keyExtractor={this.getItemKey}
                        data={items}
                        extraData={this.extraData}
                        renderItem={this.renderItem}
                        ListFooterComponent={loader}
                        contentContainerStyle={styles.listContent}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.5}
                        onViewableItemsChanged={onVisibleItemsChange}
                    />
                </Reorderable>
                {numericalEntryPopup}
                {gymExerciseEntryPopup}
                <ToastList items={toasts} onCloseToast={onCloseToast} />
            </View>
        );
    }

    public componentWillUpdate(nextProps: IActiveTrackableListProps) {
        if ((this.props.isReorderMode && this.props.items !== nextProps.items)
            || this.props.isAggregationMode !== nextProps.isAggregationMode
        ) {
            LayoutAnimation.easeInEaseOut();
        }
    }

    public componentWillReceiveProps(nextProps: IActiveTrackableListProps) {
        const {
            queryStatus,
            itemsMeta,
            isAggregationMode,
            isReorderMode,
        } = this.props;

        if (nextProps.queryStatus !== queryStatus
            || nextProps.itemsMeta !== itemsMeta
            || nextProps.isAggregationMode !== isAggregationMode
            || nextProps.isReorderMode !== isReorderMode
        ) {
            this.initExtraData(nextProps);
        }
    }

    private initExtraData(props: IActiveTrackableListProps) {
        const {
            queryStatus,
            itemsMeta,
            isAggregationMode,
            isReorderMode,
        } = props;
        this.extraData = {
            isAggregationMode,
            isReorderMode,
            itemsMeta,
            queryStatus,
        };
    }

    private renderItem = (
        itemInfo: ListRenderItemInfo<IActiveTrackableListItem>,
    ) => {
        return this.renderNode(itemInfo.item.node, itemInfo.index);
    }

    private renderNode = (node: IActiveTrackableListItemNode, index: number) => {
        switch (node.__typename) {
            case Type.Counter:
            return this.renderCounter(node as ICounter, index);
            case Type.GymExercise:
            return this.renderGymExercise(node as IGymExercise, index);
            case Type.Aggregate:
            return this.renderAggregate(node as IAggregate, index);
            case Type.NumericalGoal:
            return this.renderNumericalGoal(node as INumericalGoal, index);
            case Type.TaskGoal:
            return this.renderTaskGoal(node as ITaskGoal, index);
        }

        throw new Error("Unexpected type: " + node.__typename);
    }

    private renderCounter(item: ICounter, index: number) {
        const { id, parent, iconName, title, progress, status, creationDate } =
            item;
        const {
            itemsMeta,
            isAggregationMode,
            isReorderMode,
            onGetCounterCommands,
            onToggleItemSelect,
            onLongPressItem,
            onItemLayout,
            onPressOutItem,
        } = this.props;
        const { isDisabled, isSelected, dragStatus } = itemsMeta[id];
        const isAggregated = parent != null;
        return (
            <Counter
                key={id}
                index={index}
                id={id}
                parentId={parent && parent.id}
                iconName={iconName}
                title={title}
                progress={progress}
                isSelected={isSelected}
                isDisabled={isDisabled}
                isBatchEditMode={isAggregationMode}
                isDragged={dragStatus != null}
                isReorderMode={isReorderMode && !isAggregated}
                status={status}
                commands={onGetCounterCommands(id, isAggregated)}
                duration={Date.now() - creationDate}
                onSelectChange={onToggleItemSelect}
                onLongPress={onLongPressItem}
                onPressOut={onPressOutItem}
                onLayout={onItemLayout}
            />
        );
    }

    private renderGymExercise(item: IGymExercise, index: number) {
        const { id, iconName, title, entries, status, creationDate } = item;
        const {
            isAggregationMode,
            isReorderMode,
            itemsMeta,
            onGetGymExerciseCommands,
            onGetGymExerciseItems,
            onToggleItemSelect,
            onLongPressItem,
            onToggleItemExpand,
            onIsGymExerciseExpandable,
            onItemLayout,
            onPressOutItem,
        } = this.props;
        const { isExpanded, isDisabled, isSelected, dragStatus } =
            itemsMeta[id];
        const items =  onGetGymExerciseItems(id, entries, isExpanded!);
        return (
            <GymExercise
                key={id}
                id={id}
                index={index}
                iconName={iconName}
                title={title}
                commands={onGetGymExerciseCommands(id)}
                items={items}
                isSelected={isSelected}
                isDisabled={isDisabled}
                isDragged={dragStatus != null}
                isExpanded={isExpanded}
                isExpandable={onIsGymExerciseExpandable(items)}
                isBatchEditMode={isAggregationMode}
                isReorderMode={isReorderMode}
                status={status}
                duration={Date.now() - creationDate}
                onSelectChange={onToggleItemSelect}
                onLongPress={onLongPressItem}
                onExpandChange={onToggleItemExpand}
                onLayout={onItemLayout}
                onPressOut={onPressOutItem}
            />
        );
    }

    private renderNumericalGoal(item: INumericalGoal, index: number) {
        const {
            id,
            parent,
            iconName,
            title,
            progress,
            maxProgress,
            progressDisplayMode,
            status,
            creationDate,
        } = item;
        const {
            isAggregationMode,
            isReorderMode,
            itemsMeta,
            onGetNumericalGoalCommands,
            onToggleItemSelect,
            onLongPressItem,
            onProveItem,
            onItemLayout,
            onPressOutItem,
            onIsItemProveable,
        } = this.props;
        const { isDisabled, isSelected, isProving, dragStatus } = itemsMeta[id];
        const isAggregated = parent != null;
        const commands =
            onGetNumericalGoalCommands(id, isAggregated, status);
        return (
            <NumericalGoal
                key={id}
                id={id}
                index={index}
                parentId={parent && parent.id}
                iconName={iconName}
                title={title}
                progress={progress}
                maxProgress={maxProgress}
                progressDisplayMode={progressDisplayMode}
                isDragged={dragStatus != null}
                isSelected={isSelected}
                isDisabled={isDisabled}
                isBatchEditMode={isAggregationMode}
                isReorderMode={isReorderMode && !isAggregated}
                isProveable={onIsItemProveable(status)}
                isProving={isProving}
                status={status}
                commands={commands}
                duration={Date.now() - creationDate}
                onSelectChange={onToggleItemSelect}
                onLongPress={onLongPressItem}
                onProve={onProveItem}
                onLayout={onItemLayout}
                onPressOut={onPressOutItem}
            />
        );
    }

    private renderTaskGoal(item: ITaskGoal, index: number) {
        const {
            id,
            parent,
            iconName,
            title,
            tasks,
            progress,
            maxProgress,
            progressDisplayMode,
            status,
            creationDate,
        } = item;
        const {
            isAggregationMode,
            isReorderMode,
            itemsMeta,
            onSetTaskDone,
            onGetTaskGoalCommands,
            onToggleItemSelect,
            onToggleItemExpand,
            onProveItem,
            onLongPressItem,
            onGetVisibleTaskCount,
            onIsTaskGoalExpandable,
            onItemLayout,
            onPressOutItem,
            onIsItemProveable,
        } = this.props;
        const { isExpanded, isSelected, isDisabled, isProving, dragStatus } =
            itemsMeta[id];
        const isAggregated = parent != null;
        const visibleTaskCount =
            onGetVisibleTaskCount(isExpanded!, tasks.length);
        return (
            <TaskGoal
                key={id}
                id={id}
                parentId={parent && parent.id}
                index={index}
                commands={onGetTaskGoalCommands(id, isAggregated, status)}
                iconName={iconName}
                title={title}
                progress={progress}
                maxProgress={maxProgress}
                tasks={tasks}
                visibleTaskCount={visibleTaskCount}
                progressDisplayMode={progressDisplayMode}
                isProveable={onIsItemProveable(status)}
                isProving={isProving}
                isDragged={dragStatus != null}
                isSelected={isSelected}
                isDisabled={isDisabled}
                isExpanded={isExpanded}
                isExpandable={onIsTaskGoalExpandable(tasks.length)}
                isBatchEditMode={isAggregationMode}
                isReorderMode={isReorderMode && !isAggregated}
                status={status}
                duration={Date.now() - creationDate}
                onSelectChange={onToggleItemSelect}
                onLongPress={onLongPressItem}
                onExpandChange={onToggleItemExpand}
                onSetTaskDone={onSetTaskDone}
                onProve={onProveItem}
                onLayout={onItemLayout}
                onPressOut={onPressOutItem}
            />
        );
    }

    private renderAggregate(item: IAggregate, index: number): JSX.Element {
        const { id, progress, maxTotalProgress, children, status } = item;
        const {
            items,
            isAggregationMode,
            isReorderMode,
            itemsMeta,
            onGetAggregateCommands,
            onToggleItemSelect,
            onLongPressItem,
            onItemLayout,
            onPressOutItem,
        } = this.props;
        const { isDisabled, isSelected, dragStatus } = itemsMeta[id];
        const isAfterAggregate = index > 0
            && items[index - 1].node.__typename === Type.Aggregate;
        const isBeforeAggregate = index < items.length - 1
            && items[index + 1].node.__typename === Type.Aggregate;
        return (
            <Aggregate
                key={id}
                id={id}
                index={index}
                status={status}
                progress={progress}
                maxProgress={maxTotalProgress}
                isDragged={dragStatus != null}
                isSelected={isSelected}
                isDisabled={isDisabled}
                isBatchEditMode={isAggregationMode}
                isReorderMode={isReorderMode}
                isAfterAggregate={isAfterAggregate}
                isBeforeAggregate={isBeforeAggregate}
                isLast={index === items.length - 1}
                commands={onGetAggregateCommands(id)}
                onSelectChange={onToggleItemSelect}
                onLongPress={onLongPressItem}
                onLayout={onItemLayout}
                onPressOut={onPressOutItem}
            >
                {children.map(this.renderNode)}
            </Aggregate>
        );
    }

    private getItemKey(item: IActiveTrackableListItem) {
        return item.node.id;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
    },
    reorderablePlaceholder: {
        borderRadius: 8,
    },
});

export {
    IActiveTrackableListProps,
    IActiveTrackableListItem,
    IActiveTrackableListItemsMeta,
    IActiveTrackableListItemMeta,
    IActiveTrackableListItemNode,
    IVisibleItemsChangeInfo,
    IAggregate,
};
export default ActiveTrackableList;

import Aggregate from "components/aggregate";
import { ICommandBarItem } from "components/command-bar";
import {
    cardStyle,
    color,
    gap,
    shadeColor,
    stateColor,
} from "components/common-styles";
import Counter from "components/counter";
import EmptyList from "components/empty-list";
import FadeIn from "components/fade-in";
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
import { IWithRefreshProps } from "components/with-refresh";
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
import * as Animatable from "react-native-animatable";
import DragStatus from "utils/drag-status";
import makeLog from "utils/make-log";
import QueryStatus from "utils/query-status";

interface IVisibleItemsChangeInfo {
    viewableItems: ViewToken[];
    changed: ViewToken[];
}

interface IBaseNode {
    __typename: Type;
    id: string;
    title: string;
    order: number;
    status: TrackableStatus;
    isPublic: boolean;
    creationDate: number;
    parent?: {
        id: string;
    };
}

interface IPrimitiveNode extends IBaseNode {
    iconName: string;
}

interface ICounter extends IPrimitiveNode {
    progress: number;
}

interface IGymExercise extends IPrimitiveNode {
    recentEntries: IGymExerciseEntry[];
}

interface IAggregate extends IBaseNode {
    progress: number;
    maxTotalProgress?: number;
    children: IAggregateChild[];
}

type IAggregateChild = ITaskGoal|ICounter|INumericalGoal;

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
    isOnline?: boolean;
}

interface IActiveTrackableListProps extends IExtraData, IWithRefreshProps {
    items: IActiveTrackableListItem[];
    isNumericalEntryPopupOpen?: boolean;
    isGymExerciseEntryPopupOpen?: boolean;
    onNumericalEntryPopupClose: (entry?: number) => void;
    onGymExerciseEntryPopupClose: (entry?: IGymExerciseEntryPopupResult) =>
        void;
    onProveItem: (id: string) => void;
    onSetTaskDone?: (taskId: string, isDone: boolean) => void;
    onGetAggregateCommands: (id: string) => ICommandBarItem[]|undefined;
    onGetCounterCommands: (id: string, isAggregated: boolean) =>
        ICommandBarItem[]|undefined;
    onGetGymExerciseItems: (
        id: string,
        recentEntries: IGymExerciseEntry[],
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
    onIsItemProveable: (status: TrackableStatus) => boolean;
    onPressCounterProgress: (id: string) => void;
    onPressGymExerciseProgress: (id: string) => void;
    onPressNumericalGoalProgress: (id: string) => void;
    onCanPressProgress: (trackableStatus: TrackableStatus) => boolean;
}

const log = makeLog("active-trackable-list");

class ActiveTrackableList extends
    React.PureComponent<IActiveTrackableListProps> {
    private extraData = {} as IExtraData;

    public constructor(props: IActiveTrackableListProps, context: any) {
        super(props, context);
        this.initExtraData(props);
    }

    public render() {
        log.trace("render");
        const {
            isNumericalEntryPopupOpen,
            isGymExerciseEntryPopupOpen,
            items,
            itemsMeta,
            queryStatus,
            isReorderMode,
            isRefreshing,
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
            onRefresh,
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
            <FadeIn style={styles.container}>
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
                        refreshing={isRefreshing}
                        scrollEnabled={!isReorderMode}
                        keyExtractor={this.getItemKey}
                        data={items}
                        extraData={this.extraData}
                        renderItem={this.renderItem}
                        ListFooterComponent={loader}
                        contentContainerStyle={styles.listContent}
                        style={styles.list}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.5}
                        onViewableItemsChanged={onVisibleItemsChange}
                        onRefresh={onRefresh}
                    />
                </Reorderable>
                {numericalEntryPopup}
                {gymExerciseEntryPopup}
            </FadeIn>
        );
    }

    public componentWillReceiveProps(nextProps: IActiveTrackableListProps) {
        const {
            queryStatus,
            itemsMeta,
            isAggregationMode,
            isReorderMode,
            isOnline,
        } = this.props;

        if (nextProps.queryStatus !== queryStatus
            || nextProps.itemsMeta !== itemsMeta
            || nextProps.isAggregationMode !== isAggregationMode
            || nextProps.isReorderMode !== isReorderMode
            || nextProps.isOnline !== isOnline
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
            isOnline,
        } = props;
        this.extraData = {
            isAggregationMode,
            isOnline,
            isReorderMode,
            itemsMeta,
            queryStatus,
        };
    }

    private renderItem = (
        itemInfo: ListRenderItemInfo<IActiveTrackableListItem>,
    ) => {
        const { index, item } = itemInfo;
        const isFirst = !index;
        const isLast = index === this.props.items.length - 1;
        return this.renderNode(item.node, index, isFirst, isLast);
    }

    private renderNode = (
        node: IActiveTrackableListItemNode,
        index: number,
        isFirst: boolean,
        isLast: boolean,
    ) => {
        switch (node.__typename) {
            case Type.Counter:
            return this.renderCounter(
                node as ICounter, index, isFirst, isLast);
            case Type.GymExercise:
            return this.renderGymExercise(
                node as IGymExercise, index, isFirst, isLast);
            case Type.Aggregate:
            return this.renderAggregate(
                node as IAggregate, index, isFirst, isLast);
            case Type.NumericalGoal:
            return this.renderNumericalGoal(
                node as INumericalGoal, index, isFirst, isLast);
            case Type.TaskGoal:
            return this.renderTaskGoal(
                node as ITaskGoal, index, isFirst, isLast);
        }

        throw new Error("Unexpected type: " + node.__typename);
    }

    private renderCounter(
        item: ICounter, index: number, isFirst: boolean, isLast: boolean,
    ) {
        const { id, parent, iconName, title, progress, status, creationDate } =
            item;
        const {
            items,
            itemsMeta,
            isAggregationMode,
            isReorderMode,
            onGetCounterCommands,
            onToggleItemSelect,
            onLongPressItem,
            onItemLayout,
            onPressOutItem,
            onPressCounterProgress,
        } = this.props;
        const { isDisabled, isSelected, dragStatus } = itemsMeta[id];
        const isAggregated = parent != null;
        const onPressProgress = this.makeOnPressProgress(
            onPressCounterProgress, status);
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
                isLast={isLast}
                isFirst={isFirst}
                isNested={isAggregated}
                status={status}
                commands={onGetCounterCommands(id, isAggregated)}
                statusDuration={Date.now() - creationDate}
                onSelectChange={onToggleItemSelect}
                onLongPress={onLongPressItem}
                onPressOut={onPressOutItem}
                onPressProgress={onPressProgress}
                onLayout={onItemLayout}
            />
        );
    }

    private renderGymExercise(
        item: IGymExercise, index: number, isFirst: boolean, isLast: boolean,
    ) {
        const { id, iconName, title, recentEntries, status, creationDate } =
            item;
        const {
            items,
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
            onPressGymExerciseProgress,
        } = this.props;
        const { isExpanded, isDisabled, isSelected, dragStatus } =
            itemsMeta[id];
        const gymExerciseItems =
            onGetGymExerciseItems(id, recentEntries, isExpanded!);
        const onPressProgress = this.makeOnPressProgress(
            onPressGymExerciseProgress, status);
        return (
            <GymExercise
                key={id}
                id={id}
                index={index}
                iconName={iconName}
                title={title}
                commands={onGetGymExerciseCommands(id)}
                items={gymExerciseItems}
                isSelected={isSelected}
                isDisabled={isDisabled}
                isDragged={dragStatus != null}
                isExpanded={isExpanded}
                isExpandable={onIsGymExerciseExpandable(gymExerciseItems)}
                isBatchEditMode={isAggregationMode}
                isReorderMode={isReorderMode}
                isLast={isLast}
                isFirst={isFirst}
                status={status}
                statusDuration={Date.now() - creationDate}
                onSelectChange={onToggleItemSelect}
                onLongPress={onLongPressItem}
                onExpandChange={onToggleItemExpand}
                onLayout={onItemLayout}
                onPressOut={onPressOutItem}
                onPressProgress={onPressProgress}
            />
        );
    }

    private renderNumericalGoal(
        item: INumericalGoal, index: number, isFirst: boolean, isLast: boolean,
    ) {
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
            items,
            isAggregationMode,
            isReorderMode,
            itemsMeta,
            isOnline,
            onGetNumericalGoalCommands,
            onToggleItemSelect,
            onLongPressItem,
            onProveItem,
            onItemLayout,
            onPressOutItem,
            onIsItemProveable,
            onPressNumericalGoalProgress,
        } = this.props;
        const { isDisabled, isSelected, isProving, dragStatus } = itemsMeta[id];
        const isAggregated = parent != null;
        const commands =
            onGetNumericalGoalCommands(id, isAggregated, status);
        const onPressProgress = this.makeOnPressProgress(
            onPressNumericalGoalProgress, status);
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
                isProveDisabled={isAggregationMode}
                isProving={isProving}
                isLast={isLast}
                isFirst={isFirst}
                isNested={isAggregated}
                status={status}
                commands={commands}
                statusDuration={Date.now() - creationDate}
                onSelectChange={onToggleItemSelect}
                onLongPress={onLongPressItem}
                onProve={onProveItem}
                onLayout={onItemLayout}
                onPressOut={onPressOutItem}
                onPressProgress={onPressProgress}
            />
        );
    }

    private renderTaskGoal(
        item: ITaskGoal, index: number, isFirst: boolean, isLast: boolean,
    ) {
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
            items,
            isAggregationMode,
            isReorderMode,
            itemsMeta,
            isOnline,
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
                isProveDisabled={isAggregationMode}
                isProving={isProving}
                isDragged={dragStatus != null}
                isSelected={isSelected}
                isDisabled={isDisabled}
                isExpanded={isExpanded}
                isExpandable={onIsTaskGoalExpandable(tasks.length)}
                isBatchEditMode={isAggregationMode}
                isReorderMode={isReorderMode && !isAggregated}
                isLast={isLast}
                isFirst={isFirst}
                isNested={isAggregated}
                status={status}
                statusDuration={Date.now() - creationDate}
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

    private renderAggregate(
        item: IAggregate, index: number, isFirst: boolean, isLast: boolean,
    ): JSX.Element {
        const { id, progress, maxTotalProgress, status, title } = item;
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
        return (
            <Aggregate
                key={id}
                id={id}
                index={index}
                title={title}
                status={status}
                progress={progress}
                maxProgress={maxTotalProgress}
                isDragged={dragStatus != null}
                isSelected={isSelected}
                isDisabled={isDisabled}
                isBatchEditMode={isAggregationMode}
                isReorderMode={isReorderMode}
                isLast={index === items.length - 1}
                isFirst={!index}
                commands={onGetAggregateCommands(id)}
                onSelectChange={onToggleItemSelect}
                onLongPress={onLongPressItem}
                onLayout={onItemLayout}
                onPressOut={onPressOutItem}
            >
                {this.renderAggregateChildren(item, index)}
            </Aggregate>
        );
    }

    private renderAggregateChildren(aggregate: IAggregate, index: number) {
        const children: IAggregateChild[]  = [];

        for (const child of aggregate.children) {
            if (child.status === TrackableStatus.Active
                || child.status === TrackableStatus.PendingProof
            ) {
                children.push(child);
            }
        }

        return children.map((child, i) => {
            const isFirstChild = !i;
            const isLastChild = i === children.length - 1;
            return this.renderNode(child, index, isFirstChild, isLastChild);
        });
    }

    private getItemKey(item: IActiveTrackableListItem) {
        return item.node.id;
    }

    private makeOnPressProgress(
        handler: (trackableId: string) => void,
        trackableStatus: TrackableStatus,
    ) {
        return this.props.onCanPressProgress(trackableStatus) ?
            handler : undefined;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {},
    listContent: {},
    reorderablePlaceholder: {
        backgroundColor: shadeColor.light3,
        opacity: 0.75,
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

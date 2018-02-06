import {
    addCounterProgress,
    addCounterProgressQuery,
    IAddCounterProgressResponse,
} from "actions/add-counter-progress-action";
import {
    addGymExerciseEntry,
    addGymExerciseEntryQuery,
    IAddGymExerciseEntryResponse,
} from "actions/add-gym-exercise-entry-action";
import {
    addNumericalGoalProgress,
    addNumericalGoalProgressQuery,
    IAddNumericalGoalProgressResponse,
} from "actions/add-numerical-goal-progress-action";
import {
    aggregateTrackables,
    aggregateTrackablesQuery,
    IAggregateTrackablesResponse,
} from "actions/aggregate-trackables-action";
import {
    breakAggregate,
    breakAggregateQuery,
    IBreakAggregateResponse,
} from "actions/break-aggregate-action";
import {
    IProveTrackableResponse,
    proveTrackable,
    proveTrackableQuery,
} from "actions/prove-trackable-action";
import {
    IRemoveTrackableResponse,
    removeTrackable,
    removeTrackableQuery,
} from "actions/remove-trackable-action";
import {
    IReorderTrackableResponse,
    reorderTrackable,
    reorderTrackableQuery,
} from "actions/reorder-trackable-action";
import {
    ISetTaskDoneResponse,
    setTaskDone,
    setTaskDoneQuery,
} from "actions/set-task-done-action";
import {
    IUnaggregateTrackableResponse,
    unaggregateTrackable,
    unaggregateTrackableQuery,
} from "actions/unaggregate-trackable-action";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import ActiveTrackableList, {
    IActiveTrackableListItem,
    IActiveTrackableListItemMeta,
    IActiveTrackableListItemNode,
    IActiveTrackableListItemsMeta,
    IActiveTrackableListProps,
    IAggregate,
    IVisibleItemsChangeInfo,
} from "components/active-trackable-list";
import { ICommandBarItem } from "components/command-bar";
import Error from "components/error";
import { IGymExerciseEntry, IGymExerciseItem } from "components/gym-exercise";
import {
    IGymExerciseEntryPopupResult,
} from "components/gym-exercise-entry-popup";
import { IHeaderState, IWithHeaderProps, withHeader } from "components/header";
import Loader from "components/loader";
import gql from "graphql-tag";
import { debounce, memoize, throttle } from "lodash";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { withApollo } from "react-apollo/withApollo";
import { InjectedIntlProps, injectIntl } from "react-intl";
import {
    Alert,
    LayoutRectangle,
    NativeScrollEvent,
    NativeSyntheticEvent,
    PanResponderGestureState,
    ViewToken,
} from "react-native";
import ImagePicker, { Image } from "react-native-image-crop-picker";
import { RouteComponentProps, withRouter } from "react-router";
import DragStatus from "utils/drag-status";
import { IConnection, IFetchMore } from "utils/interfaces";
import myId from "utils/my-id";
import { isLoading } from "utils/query-status";
import QueryStatus from "utils/query-status";
import routes from "utils/routes";
import withError from "utils/with-error";
import withLoader from "utils/with-loader";

type IActiveTrackableListContainerProps =
    RouteComponentProps<IRouteParams>
    & InjectedIntlProps
    & IWithHeaderProps
    & {
    data: QueryProps & IGetDataResponse;
    onSetTaskDone: (taskId: string, isDone: boolean) => void;
    onBreakItem: (id: string) => void;
    onUnaggregateItem: (id: string) => void;
    onCommitProveItem: (id: string, photo: Image) => void;
    onCommitRemoveItem: (id: string) => void;
    onCommitAddNumericalGoalProgress: (id: string, amount: number) => void;
    onCommitNewGymExerciseEntry:
        (id: string, entry: IGymExerciseEntryPopupResult) => void;
    onCommitAggregateItems: (ids: string[]) => void;
    onCommitAddCounterProgress: (id: string, amount: number) => void;
    onReorderItem: (sourceId: string, destinationId: string) => void;
    onLongPressItem: (id: string) => void;
};

interface IActiveTrackableListContainerState {
    itemsMeta: IActiveTrackableListItemsMeta;
    isAggregationMode?: boolean;
    isReorderMode?: boolean;
    numericalEntryPopup: {
        isOpen?: boolean;
        onClose: (entry?: number) => void;
    };
    gymExerciseEntryPopup: {
        isOpen?: boolean;
        onClose: (entry?: IGymExerciseEntryPopupResult) => void;
    };
}

interface IRouteParams {
    id: string;
}

type IOwnProps = RouteComponentProps<IRouteParams> & {
    client: ApolloClient<NormalizedCacheObject>;
};

interface IGetDataResponse {
    getActiveTrackables: IConnection<IActiveTrackableListItemNode, number>;
}

const withReorder =
    graphql<IReorderTrackableResponse, IOwnProps, IActiveTrackableListContainerProps>(
        reorderTrackableQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onReorderItem: (
                        sourceId: string, destinationId: string,
                    ) => {
                        reorderTrackable(
                            sourceId, destinationId, mutate!, ownProps.client);
                    },
                };
            },
        },
    );

const withSetTaskDone =
    graphql<ISetTaskDoneResponse, IOwnProps, IActiveTrackableListContainerProps>(
        setTaskDoneQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onSetTaskDone: (taskId: string, isDone: boolean) => {
                        setTaskDone(taskId, isDone, mutate!, ownProps.client);
                    },
                };
            },
        },
    );

const withProve =
    graphql<IProveTrackableResponse, IOwnProps, IActiveTrackableListContainerProps>(
        proveTrackableQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onCommitProveItem: (id: string, photo: Image) => {
                        proveTrackable(id, photo, mutate!, ownProps.client);
                    },
                };
            },
        },
    );

const withRemove =
    graphql<IRemoveTrackableResponse, IOwnProps, IActiveTrackableListContainerProps>(
        removeTrackableQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onCommitRemoveItem: (id: string) => {
                        removeTrackable(id, mutate!, ownProps.client);
                    },
                };
            },
        },
    );

const withAddCounterProgress =
    graphql<IAddCounterProgressResponse, IOwnProps, IActiveTrackableListContainerProps>(
        addCounterProgressQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onCommitAddCounterProgress: (id: string, value: number) => {
                        addCounterProgress(id, value, mutate!, ownProps.client);
                    },
                };
            },
        },
    );

const withAddNumericalGoalProgress =
    graphql<IAddNumericalGoalProgressResponse, IOwnProps, IActiveTrackableListContainerProps>(
        addNumericalGoalProgressQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onCommitAddNumericalGoalProgress: (
                        id: string, value: number,
                    ) => {
                        addNumericalGoalProgress(
                            id, value, mutate!, ownProps.client);
                    },
                };
            },
        },
    );

const withNewGymExerciseEntry =
    graphql<IAddGymExerciseEntryResponse, IOwnProps, IActiveTrackableListContainerProps>(
        addGymExerciseEntryQuery,
        {
            props: ({ mutate }) => {
                return {
                    onCommitNewGymExerciseEntry: (
                        trackableId: string, entry: IGymExerciseEntry,
                    ) => {
                        addGymExerciseEntry(trackableId, entry.setCount,
                            entry.repetitionCount, entry.weight, mutate!);
                    },
                };
            },
        },
    );

const withAggregate =
    graphql<IAggregateTrackablesResponse, IOwnProps, IActiveTrackableListContainerProps>(
        aggregateTrackablesQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onCommitAggregateItems: (ids: string[]) => {
                        aggregateTrackables(ids, mutate!, ownProps.client);
                    },
                };
            },
        },
    );

const withUnaggregate =
    graphql<IUnaggregateTrackableResponse, IOwnProps, IActiveTrackableListContainerProps>(
        unaggregateTrackableQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onUnaggregateItem: (id: string) => {
                        unaggregateTrackable(id, mutate!, ownProps.client);
                    },
                };
            },
        },
    );

const withBreak =
    graphql<IBreakAggregateResponse, IOwnProps, IActiveTrackableListContainerProps>(
        breakAggregateQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onBreakItem: (id: string) => {
                        breakAggregate(id, mutate!, ownProps.client);
                    },
                };
            },
        },
    );

const getDataQuery = gql`
    fragment ActiveTrackableListTrackableFragment on ITrackable {
        id
        order
        status
        statusChangeDate
        creationDate
        isPublic
    }

    fragment ActiveTrackableListCounterFragment on Counter {
        parent {
            id
        }
        iconName
        title
        progress
    }

    fragment ActiveTrackableListGymExerciseFragment on GymExercise {
        iconName
        title
        entries {
            id
            date
            setCount
            repetitionCount
            weight
        }
    }

    fragment ActiveTrackableListTaskGoalFragment on TaskGoal {
        parent {
            id
        }
        iconName
        title
        progress
        maxProgress
        progressDisplayMode
        difficulty
        deadlineDate
        tasks {
            id
            goal {
                id
            }
            title
            isDone
        }
    }

    fragment ActiveTrackableListNumericalGoalFragment on NumericalGoal {
        parent {
            id
        }
        iconName
        title
        progress
        maxProgress
        progressDisplayMode
        difficulty
        deadlineDate
    }

    fragment ActiveTrackableListAggregateFragment on Aggregate {
        progress
        maxTotalProgress: maxProgress
        children {
            ...ActiveTrackableListTrackableFragment
            ...ActiveTrackableListTaskGoalFragment
            ...ActiveTrackableListNumericalGoalFragment
            ...ActiveTrackableListCounterFragment
        }
    }

    query GetData($userId: ID!, $cursor: Float) {
        getActiveTrackables(
            userId: $userId,
            after: $cursor
        ) @connection(key: "getActiveTrackables", filter: ["userId"]) {
            edges {
                cursor
                node {
                    ...ActiveTrackableListTrackableFragment
                    ...ActiveTrackableListCounterFragment
                    ...ActiveTrackableListGymExerciseFragment
                    ...ActiveTrackableListNumericalGoalFragment
                    ...ActiveTrackableListTaskGoalFragment
                    ...ActiveTrackableListAggregateFragment
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }`;

const withData =
    graphql<IGetDataResponse, IOwnProps, IActiveTrackableListContainerProps>(
        getDataQuery,
        {
            options: (ownProps) => {
                return {
                    notifyOnNetworkStatusChange: true,
                    variables: { userId: ownProps.match.params.id },
                };
            },
            props: ({ data }) => {
                const queryStatus = data!.networkStatus;

                if (queryStatus === QueryStatus.InitialLoading
                    || queryStatus === QueryStatus.Error
                ) {
                    return { queryStatus };
                }

                return { queryStatus, data };
            },
        },
    );

const collapsedTaskCount = 2;
const gymExerciseDayCount = 4;

class ActiveTrackableListContainer extends
    React.Component<IActiveTrackableListContainerProps, IActiveTrackableListContainerState> {
    public state: IActiveTrackableListContainerState = {
        gymExerciseEntryPopup: { onClose: () => null },
        itemsMeta: {},
        numericalEntryPopup: { onClose: () => null },
    };
    private itemLayouts: { [id: string]: LayoutRectangle|undefined } = {};
    private draggedItemId?: string;
    private visibleItemIds: string[] = [];

    public constructor(
        props: IActiveTrackableListContainerProps, context: any,
    ) {
        super(props, context);
        this.initItemsMeta(props.data.getActiveTrackables.edges);
        this.getGymExerciseItems = memoize(
            this.getGymExerciseItems, this.resolveGetGymExerciseItemsCacheKey);
        this.getTaskGoalCommands = memoize(
            this.getTaskGoalCommands, this.resolveGetGoalCommandsCacheKey);
        this.getNumericalGoalCommands = memoize(
            this.getNumericalGoalCommands, this.resolveGetGoalCommandsCacheKey);
        this.getCounterCommands = memoize(
            this.getCounterCommands, this.resolveGetCounterCommandsCacheKey);
        this.getAggregateCommands = memoize(this.getAggregateCommands,
            this.resolveGetAggregateCommandsCacheKey);
        this.getGymExerciseCommands = memoize(this.getGymExerciseCommands,
            this.resolveGetGymExerciseCommandsCacheKey);
        this.onEndReached = throttle(this.onEndReached, 1024);
    }

    public render() {
        const {
            numericalEntryPopup,
            gymExerciseEntryPopup,
            isAggregationMode,
            isReorderMode,
            itemsMeta,
        } = this.state;
        const { onSetTaskDone, onReorderItem, data } = this.props;
        const { getActiveTrackables, networkStatus } = data;
        return (
            <ActiveTrackableList
                isNumericalEntryPopupOpen={numericalEntryPopup.isOpen}
                isGymExerciseEntryPopupOpen={gymExerciseEntryPopup.isOpen}
                isAggregationMode={isAggregationMode}
                isReorderMode={isReorderMode}
                itemsMeta={itemsMeta}
                items={data.getActiveTrackables.edges}
                queryStatus={data.networkStatus}
                onNumericalEntryPopupClose={numericalEntryPopup.onClose}
                onGymExerciseEntryPopupClose={gymExerciseEntryPopup.onClose}
                onProveItem={this.onStartProveItem}
                onSetTaskDone={onSetTaskDone}
                onGetAggregateCommands={this.getAggregateCommands}
                onGetCounterCommands={this.getCounterCommands}
                onGetGymExerciseCommands={this.getGymExerciseCommands}
                onGetNumericalGoalCommands={this.getNumericalGoalCommands}
                onGetTaskGoalCommands={this.getTaskGoalCommands}
                onGetGymExerciseItems={this.getGymExerciseItems}
                onEndReached={this.onEndReached}
                onToggleItemSelect={this.onToggleItemSelect}
                onToggleItemExpand={this.onToggleItemExpand}
                onGetTaskGoalExpandable={this.onGetTaskGoalExpandable}
                onGetVisibleTaskCount={this.onGetVisibleTaskCount}
                onGetGymExerciseExpandable={this.onGetGymExerciseExpandable}
                onReorderItem={onReorderItem}
                onStartReorderItem={this.onStartReorderItem}
                onEndReorderItem={this.onEndReorderItem}
                onGetItemLayout={this.onGetItemLayout}
                onItemLayout={this.onItemLayout}
                onLongPressItem={this.onLongPressItem}
                onPressOutItem={this.onPressOutItem}
                onVisibleItemsChange={this.onVisibleItemsChange}
                onGetDraggedItemId={this.onGetDraggedItemId}
                onGetVisibleItemIds={this.onGetVisibleItemIds}
            />
        );
    }

    public componentWillReceiveProps(
        nextProps: IActiveTrackableListContainerProps,
    ) {
        if (nextProps.data.getActiveTrackables.edges !==
            this.props.data.getActiveTrackables.edges
        ) {
            this.initItemsMeta(nextProps.data.getActiveTrackables.edges);
        }
    }

    private initItemsMeta(items: IActiveTrackableListItem[]) {
        const { itemsMeta } = this.state;

        for (const { node } of items) {
            if (!itemsMeta[node.id]) {
                itemsMeta[node.id] = {};
            }

            if (node.__typename === Type.Aggregate) {
                for (const child of (node as IAggregate).children) {
                    if (!itemsMeta[child.id]) {
                        itemsMeta[child.id] = {};
                    }
                }
            }
        }
    }

    private getGymExerciseCommands = (id: string) => {
        return [
            {
                msgId: "commands.remove",
                run: () => this.onStartRemoveItem(id),
            },
            {
                msgId: "commands.edit",
                run: () => this.onEditItem(id),
            },
            {
                msgId: "commands.addProgress",
                run: () => this.onStartNewGymExerciseEntry(id),
            },
        ] as ICommandBarItem[];
    }

    private resolveGetGymExerciseCommandsCacheKey(id: string) {
        return id;
    }

    private getTaskGoalCommands = (
        id: string, isAggregated: boolean, status: TrackableStatus,
    ) => {
        return this.getGoalCommands(id, isAggregated, status);
    }

    private getNumericalGoalCommands = (
        id: string, isAggregated: boolean, status: TrackableStatus,
    ) => {
        const additionalCommand = {
            msgId: "commands.addProgress",
            run: () => this.onStartAddNumericalGoalProgress(id),
        };
        return this.getGoalCommands(
            id, isAggregated, status, additionalCommand);
    }

    private resolveGetGoalCommandsCacheKey(
        id: string, isAggregated: boolean, status: TrackableStatus,
    ) {
        return `${id}_${isAggregated ? 1 : 0}_${status}`;
    }

    private getGoalCommands(
        id: string,
        isAggregated: boolean,
        status: TrackableStatus,
        additionalCommand?: ICommandBarItem,
    ) {
        const commands: ICommandBarItem[] = [
            {
                msgId: "commands.remove",
                run: () => this.onStartRemoveItem(id),
            },
        ];

        if (status === TrackableStatus.PendingProof) {
            return commands;
        }

        commands.push({
            msgId: "commands.edit",
            run: () => this.onEditItem(id),
        });

        if (additionalCommand) {
            commands.push(additionalCommand);
        }

        if (isAggregated) {
            commands.push({
                msgId: "commands.unaggregate",
                run: () => this.props.onUnaggregateItem(id),
            });
        } else {
            commands.push({
                msgId: "commands.aggregate",
                run: () => this.onStartAggregateItem(id),
            });
        }

        return commands;
    }

    private getCounterCommands = (id: string, isAggregated: boolean) => {
        const commands: ICommandBarItem[] = [
            {
                msgId: "commands.remove",
                run: () => this.onStartRemoveItem(id),
            },
            {
                msgId: "commands.edit",
                run: () => this.onEditItem(id),
            },
            {
                msgId: "commands.addProgress",
                run: () => this.onStartAddCounterProgress(id),
            },
        ];

        if (isAggregated) {
            commands.push({
                msgId: "commands.unaggregate",
                run: () => this.props.onUnaggregateItem(id),
            });
        } else {
            commands.push({
                msgId: "commands.aggregate",
                run: () => this.onStartAggregateItem(id),
            });
        }

        return commands;
    }

    private resolveGetCounterCommandsCacheKey = (
        id: string, isAggregated: boolean,
    ) => {
        return `${id}_${isAggregated ? 1 : 0}`;
    }

    private getAggregateCommands = (id: string) => {
        return [
            {
                msgId: "commands.break",
                run: () => this.props.onBreakItem(id),
            },
        ] as ICommandBarItem[];
    }

    private resolveGetAggregateCommandsCacheKey = (id: string) => {
        return id;
    }

    private getGymExerciseItems = (
        id: string, entries: IGymExerciseEntry[], isExpanded?: boolean,
    ) => {
        const items = new Array<IGymExerciseItem>(gymExerciseDayCount);
        const dateToItemMap: { [timestamp: number]: number } = {};
        const date = new Date();
        let timestamp = date.setHours(0, 0, 0, 0);

        for (let i = gymExerciseDayCount - 1; i >= 0 ; --i) {
            items[i] = {
                date: timestamp,
                entries: [],
            };
            dateToItemMap[timestamp] = i;
            timestamp = date.setDate(date.getDate() - 1);
        }

        for (const entry of entries) {
            date.setTime(entry.date);
            timestamp = date.setHours(0, 0, 0, 0);
            const itemIndex = dateToItemMap[timestamp];

            if (itemIndex != null) {
                items[itemIndex].entries.push(entry);
            }
        }

        if (isExpanded) {
            return items;
        }

        this.averageGymExerciseItems(items);
        return items;
    }

    private averageGymExerciseItems(items: IGymExerciseItem[]) {
        for (const item of items) {
            if (!item.entries.length) {
                continue;
            }

            let setCount = 0;
            let repetitionCount = 0;
            let weight = 0;

            for (const entry of item.entries) {
                setCount += entry.setCount;
                repetitionCount += entry.setCount * entry.repetitionCount;
                weight += entry.setCount * entry.weight;
            }

            repetitionCount = repetitionCount / setCount;
            weight = weight / setCount;
            item.entries = [{
                date: item.date,
                id: "0",
                repetitionCount,
                setCount,
                weight,
            }];
        }
    }

    private resolveGetGymExerciseItemsCacheKey(
        id: string, entries: IGymExerciseEntry[], isExpanded?: boolean,
    ) {
        const entriesKey = entries.length ? entries[0].id : "";
        return `${id}_${isExpanded ? "1" : "0"}_${entriesKey}`;
    }

    private updateItemMeta(
        id: string,
        props: IActiveTrackableListItemMeta,
        itemsMeta: IActiveTrackableListItemsMeta,
    ) {
        return {
            ...itemsMeta,
            [id]: {
                ...itemsMeta[id],
                ...props,
            },
        };
    }

    private getSelectedItemIds() {
        const itemIds = [];
        const { itemsMeta } = this.state;

        for (const itemId in itemsMeta) {
            if (itemsMeta[itemId].isSelected) {
                itemIds.push(itemId);
            }
        }

        return itemIds;
    }

    private canAggregate(
        selectedItems: IActiveTrackableListItemNode[],
        targetItem: IActiveTrackableListItemNode,
    ) {
        const isTargetAggregated = targetItem.parent != null;

        if (isTargetAggregated) {
            return false;
        }

        const targetItemType = targetItem.__typename;

        if (targetItemType === Type.GymExercise) {
            return false;
        }

        if (!selectedItems.length) {
            return targetItemType === Type.Counter
                || targetItemType === Type.NumericalGoal
                || targetItemType === Type.TaskGoal
                || targetItemType === Type.Aggregate;
        }

        for (const selectedItem of selectedItems) {
            if (selectedItem.isPublic !== targetItem.isPublic) {
                return false;
            }
        }

        let targetItemPrimitiveType;

        if (targetItemType === Type.Aggregate) {
            for (const selectedItem of selectedItems) {
                if (selectedItem.__typename === Type.Aggregate) {
                    return false;
                }
            }

            targetItemPrimitiveType =
                (targetItem as IAggregate).children[0].__typename;
        } else {
            targetItemPrimitiveType = targetItemType;
        }

        let selectedItemPrimitiveType;

        for (const selectedItem of selectedItems) {
            if (selectedItem.__typename === Type.Aggregate) {
                selectedItemPrimitiveType =
                    (selectedItem as IAggregate).children[0].__typename;
            } else {
                selectedItemPrimitiveType = selectedItem.__typename;
            }

            break;
        }

        switch (targetItemPrimitiveType) {
            case Type.Counter:
            return selectedItemPrimitiveType === Type.Counter;
            case Type.NumericalGoal:
            case Type.TaskGoal:
            return selectedItemPrimitiveType === Type.NumericalGoal
                || selectedItemPrimitiveType === Type.TaskGoal;
        }

        return false;
    }

    private updateAggregationTargets(itemsMeta: IActiveTrackableListItemsMeta) {
        const selectedItems = [];
        const selectedItemIds = [];
        const items = this.props.data.getActiveTrackables.edges;

        for (const { node: item } of items) {
            if (itemsMeta[item.id].isSelected) {
                selectedItems.push(item);
                selectedItemIds.push(item.id);
            }
        }

        for (const { node: item } of items) {
            if (item.__typename === Type.Aggregate) {
                for (const child of (item as IAggregate).children) {
                    itemsMeta[child.id].isDisabled = true;
                }
            }

            if (selectedItemIds.indexOf(item.id) !== -1) {
                continue;
            }

            itemsMeta[item.id].isDisabled =
                !this.canAggregate(selectedItems, item);
        }
    }

    private openNumericalEntryPopup(onClose: (entry?: number) => void) {
        this.setState({
            numericalEntryPopup: {
                isOpen: true,
                onClose: (entry) => {
                    this.setState((prevState) => {
                        onClose(entry);
                        return {
                            numericalEntryPopup: {
                                ...prevState.numericalEntryPopup,
                                isOpen: false,
                            },
                        };
                    });
                },
            },
        });
    }

    private openGymExerciseEntryPopup(
        onClose: (entry?: IGymExerciseEntryPopupResult) => void,
    ) {
        this.setState({
            gymExerciseEntryPopup: {
                isOpen: true,
                onClose: (entry) => {
                    this.setState((prevState) => {
                        onClose(entry);
                        return {
                            gymExerciseEntryPopup: {
                                ...prevState.gymExerciseEntryPopup,
                                isOpen: false,
                            },
                        };
                    });
                },
            },
        });
    }

    private unselectAndEnableItems(itemsMeta: IActiveTrackableListItemsMeta) {
        const newItemsMeta: IActiveTrackableListItemsMeta = {};

        // tslint:disable-next-line:forin
        for (const itemId in itemsMeta) {
            newItemsMeta[itemId] = {
                ...itemsMeta[itemId],
                isDisabled: false,
                isSelected: false,
            };
        }

        return newItemsMeta;
    }

    private onStartAggregateItem = (id: string) => {
        this.setState((prevState) => {
            const itemsMeta = this.updateItemMeta(
                id, { isSelected: true }, prevState.itemsMeta);
            this.updateAggregationTargets(itemsMeta);
            this.props.header.push({
                hideBackCommand: true,
                leftCommand: {
                    msgId: "common.cancel",
                    onRun: this.onCancelAggregateItem,
                },
                rightCommands: [
                    {
                        isPrimary: true,
                        msgId: "common.done",
                        onRun: this.onCommitAggregateItem,
                    },
                ],
            });
            return { isAggregationMode: true, itemsMeta };
        });
    }

    private onCancelAggregateItem = () => {
        this.setState((prevState) => {
            const itemsMeta = this.unselectAndEnableItems(prevState.itemsMeta);
            this.props.header.pop();
            return { isAggregationMode: false, itemsMeta };
        });
    }

    private onCommitAggregateItem = () => {
        const selectedItemIds = this.getSelectedItemIds();
        this.onCancelAggregateItem();

        if (selectedItemIds.length < 2) {
            return;
        }

        this.props.onCommitAggregateItems(selectedItemIds);
    }

    private onStartRemoveItem = (id: string) => {
        const msg = undefined;
        const { formatMessage } = this.props.intl;
        Alert.alert(formatMessage({ id: "common.confirmRemoval" }), msg, [
            {
                onPress: () => this.onCommitRemoveItem(id),
                text: formatMessage({ id: "common.yes" }),
            },
            {
                style: "cancel",
                text: formatMessage({ id: "common.cancel" }),
            },
        ]);
    }

    private onCommitRemoveItem(id: string) {
        this.setState((prevState) => {
            this.props.onCommitRemoveItem(id);
            const itemsMeta = { ...prevState.itemsMeta, [id]: {} };
            return { itemsMeta };
        });
    }

    private onToggleItemExpand = (id: string, isExpanded: boolean) => {
        this.setState((prevState) => {
            const itemsMeta = this.updateItemMeta(
                id, { isExpanded }, prevState.itemsMeta);
            return { itemsMeta };
        });
    }

    private onToggleItemSelect = (id: string, isSelected: boolean) => {
        this.setState((prevState) => {
            const itemsMeta = this.updateItemMeta(
                id, { isSelected }, prevState.itemsMeta);

            if (prevState.isAggregationMode) {
                this.updateAggregationTargets(itemsMeta);
            }

            return { itemsMeta };
        });
    }

    private onStartAddCounterProgress = (id: string) => {
        this.openNumericalEntryPopup((entry) => {
            if (entry) {
                this.props.onCommitAddCounterProgress(id, entry);
            }
        });
    }

    private onStartAddNumericalGoalProgress = (id: string) => {
        this.openNumericalEntryPopup((entry) => {
            if (entry) {
                this.props.onCommitAddNumericalGoalProgress(id, entry);
            }
        });
    }

    private onStartNewGymExerciseEntry = (id: string) => {
        this.openGymExerciseEntryPopup((entry) => {
            if (entry) {
                this.props.onCommitNewGymExerciseEntry(id, entry);
            }
        });
    }

    private onEndReached = () => {
        const { getActiveTrackables, networkStatus } = this.props.data;

        if (getActiveTrackables.pageInfo.hasNextPage
            && !isLoading(networkStatus)
        ) {
            this.loadMore();
        }
    }

    private loadMore() {
        const { fetchMore, getActiveTrackables } = this.props.data;
        fetchMore({
            updateQuery: (previousResult, { fetchMoreResult }) => {
                const { edges, pageInfo } =
                    (fetchMoreResult as IGetDataResponse).getActiveTrackables;

                if (!edges.length) {
                    return {
                        ...previousResult,
                        getActiveTrackables: {
                            ...previousResult.getActiveTrackables,
                            pageInfo,
                        },
                    } as IGetDataResponse;
                }

                const previousEdges = (previousResult as IGetDataResponse)
                    .getActiveTrackables.edges;
                return {
                    ...fetchMoreResult,
                    getActiveTrackables: {
                        ...fetchMoreResult!.getActiveTrackables,
                        edges: previousEdges.concat(edges),
                    },
                } as IGetDataResponse;
            },
            variables: { cursor: getActiveTrackables.pageInfo.endCursor },
        });
    }

    private onStartProveItem = async (id: string) => {
        let image;

        try {
            image = await ImagePicker.openPicker({
                includeBase64: false,
                mediaType: "photo",
            }) as Image;
        } catch (e) {
            if (e.code === "E_PICKER_CANCELLED") {
                return;
            }

            // TODO
            throw e;
        }

        if (!image) {
            return;
        }

        this.props.onCommitProveItem(id, image);
    }

    private onEditItem = (id: string) => {
        this.props.history.push(
            routes.trackableEdit.path.replace(":id", id));
    }

    private onGetTaskGoalExpandable = (taskCount: number) => {
        return taskCount > collapsedTaskCount;
    }

    private onGetGymExerciseExpandable = (items: IGymExerciseItem[]) => {
        for (const item of items) {
            if (item.entries.length) {
                return true;
            }
        }

        return false;
    }

    private onGetVisibleTaskCount = (
        isExpanded: boolean, taskCount: number,
    ) => {
        return isExpanded ? taskCount : Math.min(taskCount, collapsedTaskCount);
    }

    private onLongPressItem = (id: string, parentId?: string) => {
        this.setState((prevState) => {
            const { isAggregationMode, itemsMeta } = prevState;
            const { isDisabled, dragStatus } = itemsMeta[id];

            if (parentId
                || isAggregationMode
                || isDisabled
                || dragStatus != null
            ) {
                return null as any;
            }

            this.draggedItemId = id;
            const newItemsMeta = this.updateItemMeta(
                id, { dragStatus: DragStatus.WillDrag }, prevState.itemsMeta);
            return { isReorderMode: true, itemsMeta: newItemsMeta };
        });
    }

    private onPressOutItem = (id: string) => {
        // delay handler to get correct drag status
        requestAnimationFrame(() => {
            if (this.state.itemsMeta[id].dragStatus === DragStatus.WillDrag) {
                this.onEndReorderItem();
            }
        });
    }

    private onEndReorderItem = () => {
        this.setState((prevState, props) => {
            const newItemsMeta = this.updateItemMeta(this.draggedItemId!,
                { dragStatus: undefined }, prevState.itemsMeta);
            this.draggedItemId = undefined;
            return { isReorderMode: false, itemsMeta: newItemsMeta };
        });
    }

    private onStartReorderItem = () => {
        this.setState((prevState) => {
            const itemsMeta = this.updateItemMeta(this.draggedItemId!,
                { dragStatus: DragStatus.Dragged }, prevState.itemsMeta);
            return { itemsMeta };
        });
    }

    private onItemLayout = (id: string, layout?: LayoutRectangle) => {
        this.itemLayouts[id] = layout;
    }

    private onGetItemLayout = (id: string) => {
        return this.itemLayouts[id];
    }

    private onGetDraggedItemId = () => {
        return this.draggedItemId!;
    }

    private onGetVisibleItemIds = () => {
        return this.visibleItemIds;
    }

    private onVisibleItemsChange = (info: IVisibleItemsChangeInfo) => {
        this.visibleItemIds = info.viewableItems.map(
            (item) => (item.item as IActiveTrackableListItem).node.id);
    }
}

export default compose(
    withRouter,
    withData,
    withLoader(Loader, 512),
    withError(Error),
    withApollo,
    withReorder,
    withSetTaskDone,
    withProve,
    withRemove,
    withAddCounterProgress,
    withAddNumericalGoalProgress,
    withNewGymExerciseEntry,
    withUnaggregate,
    withBreak,
    withAggregate,
    withHeader,
    injectIntl,
)(ActiveTrackableListContainer);

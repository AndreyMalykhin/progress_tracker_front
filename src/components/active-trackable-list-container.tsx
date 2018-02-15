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
import EmptyList from "components/empty-list";
import Error from "components/error";
import { IGymExerciseEntry, IGymExerciseItem } from "components/gym-exercise";
import {
    IGymExerciseEntryPopupResult,
} from "components/gym-exercise-entry-popup";
import { IHeaderState } from "components/header";
import Loader from "components/loader";
import Toast from "components/toast";
import { IToastListItem } from "components/toast-list";
import withEmptyList from "components/with-empty-list";
import withError from "components/with-error";
import withHeader, { IWithHeaderProps } from "components/with-header";
import withLoadMore, { IWithLoadMoreProps } from "components/with-load-more";
import withLoader from "components/with-loader";
import gql from "graphql-tag";
import { debounce, memoize, throttle } from "lodash";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import * as React from "react";
import { ReactNode } from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { withApollo } from "react-apollo/withApollo";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
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
import { IConnection } from "utils/connection";
import DragStatus from "utils/drag-status";
import { push, removeIndex } from "utils/immutable-utils";
import myId from "utils/my-id";
import { isLoading } from "utils/query-status";
import QueryStatus from "utils/query-status";
import routes from "utils/routes";

interface IActiveTrackableListContainerProps extends
    RouteComponentProps<IRouteParams>,
    InjectedIntlProps,
    IWithHeaderProps,
    IWithLoadMoreProps {
    data: QueryProps & IGetDataResponse;
    onSetTaskDone: (taskId: string, isDone: boolean) =>
        Promise<ISetTaskDoneResponse>;
    onBreakItem: (id: string) => void;
    onUnaggregateItem: (id: string) => void;
    onCommitProveItem: (id: string, photo: Image) =>
        Promise<IProveTrackableResponse>;
    onCommitRemoveItem: (id: string) => void;
    onCommitAddNumericalGoalProgress: (id: string, amount: number) =>
        Promise<IAddNumericalGoalProgressResponse>;
    onCommitNewGymExerciseEntry:
        (id: string, entry: IGymExerciseEntryPopupResult) => void;
    onCommitAggregateItems: (ids: string[]) => void;
    onCommitAddCounterProgress: (id: string, amount: number) => void;
    onReorderItem: (sourceId: string, destinationId: string) => void;
    onLongPressItem: (id: string) => void;
}

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
    toasts: IToastListItem[];
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
                } as Partial<IActiveTrackableListContainerProps>;
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
                        return setTaskDone(
                            taskId, isDone, mutate!, ownProps.client);
                    },
                } as Partial<IActiveTrackableListContainerProps>;
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
                        return proveTrackable(
                            id, photo, mutate!, ownProps.client);
                    },
                } as Partial<IActiveTrackableListContainerProps>;
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
                } as Partial<IActiveTrackableListContainerProps>;
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
                } as Partial<IActiveTrackableListContainerProps>;
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
                        return addNumericalGoalProgress(
                            id, value, mutate!, ownProps.client);
                    },
                } as Partial<IActiveTrackableListContainerProps>;
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
                } as Partial<IActiveTrackableListContainerProps>;
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
                } as Partial<IActiveTrackableListContainerProps>;
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
                } as Partial<IActiveTrackableListContainerProps>;
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
                } as Partial<IActiveTrackableListContainerProps>;
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
const gymExerciseVisibleDayCount = 4;

class ActiveTrackableListContainer extends
    React.Component<IActiveTrackableListContainerProps, IActiveTrackableListContainerState> {
    public state: IActiveTrackableListContainerState = {
        gymExerciseEntryPopup: { onClose: () => null },
        itemsMeta: {},
        numericalEntryPopup: { onClose: () => null },
        toasts: [],
    };
    private itemLayouts: { [id: string]: LayoutRectangle|undefined } = {};
    private draggedItemId?: string;
    private visibleItemIds: string[] = [];

    public constructor(
        props: IActiveTrackableListContainerProps, context: any,
    ) {
        super(props, context);
        this.initItemsMeta(props.data.getActiveTrackables.edges);
        this.onGetGymExerciseItems = memoize(
            this.onGetGymExerciseItems,
            this.resolveOnGetGymExerciseItemsCacheKey,
        );
        this.onGetTaskGoalCommands = memoize(
            this.onGetTaskGoalCommands, this.resolveOnGetGoalCommandsCacheKey);
        this.onGetNumericalGoalCommands = memoize(
            this.onGetNumericalGoalCommands,
            this.resolveOnGetGoalCommandsCacheKey,
        );
        this.onGetCounterCommands = memoize(
            this.onGetCounterCommands,
            this.resolveOnGetCounterCommandsCacheKey,
        );
        this.onGetAggregateCommands = memoize(this.onGetAggregateCommands,
            this.resolveOnGetAggregateCommandsCacheKey);
        this.onGetGymExerciseCommands = memoize(this.onGetGymExerciseCommands,
            this.resolveOnGetGymExerciseCommandsCacheKey);
    }

    public render() {
        const {
            numericalEntryPopup,
            gymExerciseEntryPopup,
            isAggregationMode,
            isReorderMode,
            itemsMeta,
            toasts,
        } = this.state;
        const { onReorderItem, onLoadMore, data } = this.props;
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
                toasts={toasts}
                onNumericalEntryPopupClose={numericalEntryPopup.onClose}
                onGymExerciseEntryPopupClose={gymExerciseEntryPopup.onClose}
                onProveItem={this.onStartProveItem}
                onSetTaskDone={this.onSetTaskDone}
                onGetAggregateCommands={this.onGetAggregateCommands}
                onGetCounterCommands={this.onGetCounterCommands}
                onGetGymExerciseCommands={this.onGetGymExerciseCommands}
                onGetNumericalGoalCommands={this.onGetNumericalGoalCommands}
                onGetTaskGoalCommands={this.onGetTaskGoalCommands}
                onGetGymExerciseItems={this.onGetGymExerciseItems}
                onEndReached={onLoadMore}
                onToggleItemSelect={this.onToggleItemSelect}
                onToggleItemExpand={this.onToggleItemExpand}
                onIsTaskGoalExpandable={this.onIsTaskGoalExpandable}
                onGetVisibleTaskCount={this.onGetVisibleTaskCount}
                onIsGymExerciseExpandable={this.onIsGymExerciseExpandable}
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
                onCloseToast={this.onCloseToast}
                onIsItemProveable={this.onIsItemProveable}
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

    private onGetGymExerciseCommands = (id: string) => {
        if (!this.isMy()) {
            return undefined;
        }

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

    private resolveOnGetGymExerciseCommandsCacheKey(id: string) {
        return id;
    }

    private onGetTaskGoalCommands = (
        id: string, isAggregated: boolean, status: TrackableStatus,
    ) => {
        return this.getGoalCommands(id, isAggregated, status);
    }

    private onGetNumericalGoalCommands = (
        id: string, isAggregated: boolean, status: TrackableStatus,
    ) => {
        const additionalCommand = {
            msgId: "commands.addProgress",
            run: () => this.onStartAddNumericalGoalProgress(id),
        };
        return this.getGoalCommands(
            id, isAggregated, status, additionalCommand);
    }

    private resolveOnGetGoalCommandsCacheKey(
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
        if (!this.isMy()) {
            return undefined;
        }

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

    private onGetCounterCommands = (id: string, isAggregated: boolean) => {
        if (!this.isMy()) {
            return undefined;
        }

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

    private resolveOnGetCounterCommandsCacheKey = (
        id: string, isAggregated: boolean,
    ) => {
        return `${id}_${isAggregated ? 1 : 0}`;
    }

    private onGetAggregateCommands = (id: string) => {
        if (!this.isMy()) {
            return undefined;
        }

        return [
            {
                msgId: "commands.break",
                run: () => this.props.onBreakItem(id),
            },
        ] as ICommandBarItem[];
    }

    private resolveOnGetAggregateCommandsCacheKey = (id: string) => {
        return id;
    }

    private onGetGymExerciseItems = (
        id: string, entries: IGymExerciseEntry[], isExpanded?: boolean,
    ) => {
        const items: IGymExerciseItem[] = [];
        const date = new Date();
        let item: IGymExerciseItem;
        let itemTimestamp = 0;

        for (const entry of entries) {
            date.setTime(entry.date);
            const entryTimestamp = date.setUTCHours(0, 0, 0, 0);

            if (entryTimestamp !== itemTimestamp) {
                if (items.length >= gymExerciseVisibleDayCount) {
                    break;
                }

                itemTimestamp = entryTimestamp;
                item = { date: itemTimestamp, entries: [] };
                items.push(item);
            }

            item!.entries.push(entry);
        }

        items.reverse();

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

    private resolveOnGetGymExerciseItemsCacheKey(
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
                style: "cancel",
                text: formatMessage({ id: "common.cancel" }),
            },
            {
                onPress: () => this.onCommitRemoveItem(id),
                text: formatMessage({ id: "common.yes" }),
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
        this.openNumericalEntryPopup(async (entry) => {
            if (!entry) {
                return;
            }

            const response =
                await this.props.onCommitAddNumericalGoalProgress(id, entry);
            this.tryShowGoalAchievedToast(
                response.addNumericalGoalProgress.trackable.status);
        });
    }

    private tryShowGoalAchievedToast(goalStatus: TrackableStatus) {
        if (goalStatus !== TrackableStatus.PendingProof) {
            return;
        }

        this.showToast(<FormattedMessage id="notifications.goalAchieved" />);
    }

    private onStartNewGymExerciseEntry = (id: string) => {
        this.openGymExerciseEntryPopup((entry) => {
            if (entry) {
                this.props.onCommitNewGymExerciseEntry(id, entry);
            }
        });
    }

    private onStartProveItem = async (id: string) => {
        let image: Image;

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

        this.setItemProving(id, true, async () => {
            let response: IProveTrackableResponse;

            try {
                response = await this.props.onCommitProveItem(id, image);
            } catch (e) {
                // TODO
                throw e;
            } finally {
                this.setItemProving(id, false);
            }

            let msgId;

            if (response.proveTrackable.trackable.status ===
                    TrackableStatus.Approved
            ) {
                msgId = "notifications.goalApproved";
            } else {
                msgId = "notifications.goalPendingReview";
            }

            this.showToast(<FormattedMessage id={msgId} />);
        });
    }

    private setItemProving(
        id: string, isProving: boolean, onDone?: () => void,
    ) {
        this.setState((prevState) => {
            const itemsMeta = this.updateItemMeta(
                id, { isProving }, prevState.itemsMeta);
            return { itemsMeta };
        }, onDone);
    }

    private onEditItem = (id: string) => {
        this.props.history.push(
            routes.trackableEdit.path.replace(":id", id));
    }

    private onIsTaskGoalExpandable = (taskCount: number) => {
        return taskCount > collapsedTaskCount;
    }

    private onIsGymExerciseExpandable = (items: IGymExerciseItem[]) => {
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
        if (!this.isMy()) {
            return;
        }

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
        if (!this.isMy()) {
            return;
        }

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
        if (!this.isMy()) {
            return;
        }

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

    private onCloseToast = (index: number) => {
        this.setState((prevState) => {
            return { toasts: removeIndex(index, prevState.toasts) };
        });
    }

    private showToast(msg: ReactNode) {
        this.setState((prevState) => {
            return { toasts: push({ msg }, prevState.toasts) };
        });
    }

    private onSetTaskDone = async (taskId: string, isDone: boolean) => {
        if (!this.isMy()) {
            return;
        }

        const response = await this.props.onSetTaskDone(taskId, isDone);
        this.tryShowGoalAchievedToast(response.setTaskDone.task.goal.status);
    }

    private isMy() {
        return this.props.match.params.id === myId;
    }

    private onIsItemProveable = (status: TrackableStatus) => {
        return status === TrackableStatus.PendingProof && this.isMy();
    }
}

export default compose(
    withRouter,
    withData,
    withLoader(Loader, 512),
    withError(Error),
    withEmptyList<IActiveTrackableListContainerProps>(
        EmptyList, (props) => props.data.getActiveTrackables.edges),
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
    withLoadMore<IActiveTrackableListContainerProps, IGetDataResponse>(
        "getActiveTrackables", (props) => props.data),
    withHeader,
    injectIntl,
)(ActiveTrackableListContainer);

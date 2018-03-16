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
    addToAggregate,
    addToAggregateQuery,
    IAddToAggregateResponse,
} from "actions/add-to-aggregate-action";
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
import { isAnonymous } from "actions/session-helpers";
import {
    ISetTaskDoneResponse,
    setTaskDone,
    setTaskDoneQuery,
} from "actions/set-task-done-action";
import { share } from "actions/share-action";
import { addGenericErrorToast, addToast } from "actions/toast-helpers";
import { setContextMode } from "actions/ui-helpers";
import {
    IUnaggregateTrackableResponse,
    unaggregateTrackable,
    unaggregateTrackableQuery,
} from "actions/unaggregate-trackable-action";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { isApolloError } from "apollo-client/errors/ApolloError";
import ActiveTrackableList, {
    IActiveTrackableListItem,
    IActiveTrackableListItemMeta,
    IActiveTrackableListItemNode,
    IActiveTrackableListItemsMeta,
    IActiveTrackableListProps,
    IAggregate,
    IVisibleItemsChangeInfo,
} from "components/active-trackable-list";
import {
    IAggregateFormContainerHistoryState,
} from "components/aggregate-form-container";
import { ICommandBarItem } from "components/command-bar";
import EmptyList from "components/empty-list";
import Error from "components/error";
import { IGymExerciseEntry, IGymExerciseItem } from "components/gym-exercise";
import {
    IGymExerciseEntryPopupResult,
} from "components/gym-exercise-entry-popup";
import { IHeaderShape } from "components/header";
import Loader from "components/loader";
import Offline from "components/offline";
import {
    IStackingSwitchHistoryState,
    StackingSwitchAnimation,
} from "components/stacking-switch";
import Toast, { ToastSeverity } from "components/toast";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import withEmptyList from "components/with-empty-list";
import withEnsureUserLoggedIn, {
    IWithEnsureUserLoggedInProps,
} from "components/with-ensure-user-logged-in";
import withError from "components/with-error";
import withFetchPolicy, {
    IWithFetchPolicyProps,
} from "components/with-fetch-policy";
import withHeader, { IWithHeaderProps } from "components/with-header";
import withLoadMore, { IWithLoadMoreProps } from "components/with-load-more";
import withLoader from "components/with-loader";
import withLoginAction from "components/with-login-action";
import withNetworkStatus, {
    IWithNetworkStatusProps,
} from "components/with-network-status";
import withNoUpdatesInBackground from "components/with-no-updates-in-background";
import withOffline from "components/with-offline";
import withRefresh, { IWithRefreshProps } from "components/with-refresh";
import withSession, { IWithSessionProps } from "components/with-session";
import withSyncStatus, {
    IWithSyncStatusProps,
} from "components/with-sync-status";
import gql from "graphql-tag";
import { debounce, memoize, throttle } from "lodash";
import { recentDayCount } from "models/gym-exercise";
import TrackableStatus from "models/trackable-status";
import TrackableType from "models/trackable-type";
import Type from "models/type";
import { ReactNode } from "react";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { withApollo } from "react-apollo/withApollo";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import {
    Alert,
    LayoutAnimation,
    LayoutRectangle,
    NativeScrollEvent,
    NativeSyntheticEvent,
    PanResponderGestureState,
    ViewToken,
} from "react-native";
import ImagePicker, { Image } from "react-native-image-crop-picker";
import { RouteComponentProps, withRouter } from "react-router";
import { IConnection } from "utils/connection";
import dataIdFromObject from "utils/data-id-from-object";
import defaultId from "utils/default-id";
import DragStatus from "utils/drag-status";
import IHsitoryState from "utils/history-state";
import { push, removeIndex } from "utils/immutable-utils";
import { IWithApolloProps } from "utils/interfaces";
import isMyId from "utils/is-my-id";
import makeLog from "utils/make-log";
import openImgPicker from "utils/open-img-picker";
import QueryStatus from "utils/query-status";
import { isLoading } from "utils/query-status";
import routes from "utils/routes";
import Sound from "utils/sound";

interface IActiveTrackableListContainerProps extends
    IOwnProps,
    InjectedIntlProps,
    IWithHeaderProps,
    IWithRefreshProps,
    IWithEnsureUserLoggedInProps,
    IWithSyncStatusProps,
    IWithLoadMoreProps {
    data: QueryProps & IGetDataResponse;
    onSetTaskDone: (taskId: string, isDone: boolean) =>
        Promise<ISetTaskDoneResponse>;
    onBreakItem: (id: string) => Promise<any>;
    onUnaggregateItem: (id: string) => Promise<any>;
    onCommitProveItem: (id: string, photo: Image) =>
        Promise<IProveTrackableResponse>;
    onCommitRemoveItem: (id: string) => Promise<any>;
    onCommitAddNumericalGoalProgress: (id: string, amount: number) =>
        Promise<IAddNumericalGoalProgressResponse>;
    onCommitNewGymExerciseEntry: (
        id: string,
        entry: IGymExerciseEntryPopupResult,
    ) => Promise<IAddGymExerciseEntryResponse>;
    onAddItemsToAggregate: (ids: string[], aggregateId: string) => Promise<any>;
    onAddAggregate: (childIds: string[]) => Promise<any>;
    onCommitAddCounterProgress: (id: string, amount: number) => Promise<any>;
    onReorderItem: (sourceId: string, destinationId: string) =>
        Promise<any>;
    onLongPressItem: (id: string) => void;
}

interface IOwnProps extends
    RouteComponentProps<IRouteParams>,
    IWithNetworkStatusProps,
    IWithApolloProps,
    IWithSessionProps,
    IWithDIContainerProps,
    IWithFetchPolicyProps {}

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

interface IGetDataResponse {
    getActiveTrackables: IConnection<IActiveTrackableListItemNode, number>;
}

interface IShareProvedGoalFragment {
    title: string;
}

const log = makeLog("active-trackable-list-container");

const withReorder =
    graphql<IReorderTrackableResponse, IOwnProps, IActiveTrackableListContainerProps>(
        reorderTrackableQuery,
        {
            props: ({ ownProps, mutate }) => {
                return {
                    onReorderItem: (
                        sourceId: string, destinationId: string,
                    ) => {
                        return reorderTrackable(
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
                        const { client } = ownProps;
                        return proveTrackable(
                            id, photo, mutate!, client);
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
                    onCommitRemoveItem: (id: string) =>
                        removeTrackable(id, mutate!, ownProps.client),
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
                    onCommitAddCounterProgress: (id: string, value: number) =>
                        addCounterProgress(id, value, mutate!, ownProps.client),
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
                        return addGymExerciseEntry(trackableId, entry.setCount,
                            entry.repetitionCount, entry.weight, mutate!);
                    },
                } as Partial<IActiveTrackableListContainerProps>;
            },
        },
    );

const withAddToAggregate = graphql<
    IAddToAggregateResponse, IOwnProps, IActiveTrackableListContainerProps
>(
    addToAggregateQuery,
    {
        props: ({ ownProps, mutate }) => {
            return {
                onAddItemsToAggregate: (
                    ids: string[], aggregateId: string,
                ) =>
                    addToAggregate(
                        ids, aggregateId, mutate!, ownProps.client),
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
                    onUnaggregateItem: (id: string) =>
                        unaggregateTrackable(id, mutate!, ownProps.client),
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
                    onBreakItem: (id: string) =>
                        breakAggregate(id, mutate!, ownProps.client),
                } as Partial<IActiveTrackableListContainerProps>;
            },
        },
    );

const shareProvedGoalFragment = gql`
fragment ShareProvedGoalFragment on ITrackable {
    id
    title
}`;

const getDataQuery = gql`
fragment ActiveTrackableListTrackableFragment on ITrackable {
    id
    order
    status
    statusChangeDate
    creationDate
    isPublic
    title
}

fragment ActiveTrackableListCounterFragment on Counter {
    parent {
        id
    }
    iconName
    progress
}

fragment ActiveTrackableListGymExerciseFragment on GymExercise {
    iconName
    recentEntries {
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
    progress
    maxProgress
    progressDisplayMode
    difficulty
    deadlineDate
    achievementDate
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
    progress
    maxProgress
    progressDisplayMode
    difficulty
    deadlineDate
    achievementDate
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

query GetData($userId: ID, $cursor: Float) {
    getActiveTrackables(
        userId: $userId, after: $cursor
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
                let userId: string|undefined = ownProps.match.params.id;
                const { fetchPolicy, session } = ownProps;

                if (userId === defaultId || userId === session.userId) {
                    userId = undefined;
                }

                return {
                    fetchPolicy,
                    notifyOnNetworkStatusChange: true,
                    variables: { userId },
                };
            },
            skip: (ownProps: IOwnProps) => !ownProps.session.userId,
        },
    );

const collapsedTaskCount = 2;

class ActiveTrackableListContainer extends React.Component<
    IActiveTrackableListContainerProps,
    IActiveTrackableListContainerState
> {
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
        this.state.itemsMeta =
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
        } = this.state;
        const { onLoadMore, onRefresh, data, isRefreshing, isOnline } =
            this.props;
        const { getActiveTrackables, networkStatus } = data;
        return (
            <ActiveTrackableList
                isOnline={isOnline}
                isRefreshing={isRefreshing}
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
                onSetTaskDone={this.isMy() ? this.onSetTaskDone : undefined}
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
                onReorderItem={this.onCommitReorderItem}
                onStartReorderItem={this.onStartReorderItem}
                onEndReorderItem={this.onEndReorderItem}
                onGetItemLayout={this.onGetItemLayout}
                onItemLayout={this.onItemLayout}
                onLongPressItem={this.onLongPressItem}
                onPressOutItem={this.onPressOutItem}
                onVisibleItemsChange={this.onVisibleItemsChange}
                onGetDraggedItemId={this.onGetDraggedItemId}
                onGetVisibleItemIds={this.onGetVisibleItemIds}
                onIsItemProveable={this.onIsItemProveable}
                onRefresh={onRefresh}
            />
        );
    }

    public componentWillMount() {
        log.trace("componentWillMount()");
    }

    public componentWillReceiveProps(
        nextProps: IActiveTrackableListContainerProps,
    ) {
        if (nextProps.data.getActiveTrackables.edges !==
            this.props.data.getActiveTrackables.edges
        ) {
            const itemsMeta =
                this.initItemsMeta(nextProps.data.getActiveTrackables.edges);

            if (this.state.isAggregationMode) {
                this.updateAggregationTargets(itemsMeta);
            }

            this.setState({ itemsMeta });
        }
    }

    public componentWillUnmount() {
        if (this.state.isAggregationMode) {
            setContextMode(false, this.props.client);
        }
    }

    private initItemsMeta(items: IActiveTrackableListItem[]) {
        const itemsMeta = { ...this.state.itemsMeta };

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

        return itemsMeta;
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
                run: () => this.onUnaggregateItem(id),
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
                run: () => this.onUnaggregateItem(id),
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
                msgId: "commands.edit",
                run: () => this.onEditItem(id),
            },
            {
                msgId: "commands.break",
                run: () => this.onBreakItem(id),
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
                if (items.length >= recentDayCount) {
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

    private getSelectedItems() {
        const selectedItems = [];
        const { itemsMeta } = this.state;

        for (const item of this.props.data.getActiveTrackables.edges) {
            if (itemsMeta[item.node.id].isSelected) {
                selectedItems.push(item.node);
            }
        }

        return selectedItems;
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
                onClose: async (entry) => {
                    try {
                        await onClose(entry);
                    } catch (e) {
                        return;
                    }

                    this.setState((prevState) => {
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
                onClose: async (entry) => {
                    try {
                        await onClose(entry);
                    } catch (e) {
                        return;
                    }

                    this.setState((prevState) => {
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
        LayoutAnimation.easeInEaseOut();
        this.props.header.push({
            hideBackCommand: true,
            key: "activeTrackableListContainer.aggregate",
            leftCommand: {
                msgId: "common.cancel",
                onRun: () => this.onCancelAggregateItem(),
            },
            rightCommands: [
                {
                    isPrimary: true,
                    msgId: "common.done",
                    onRun: this.onCommitAggregateItem,
                },
            ],
        });
        setContextMode(true, this.props.client);
        this.setState((prevState) => {
            const itemsMeta = this.updateItemMeta(
                id, { isSelected: true }, prevState.itemsMeta);
            this.updateAggregationTargets(itemsMeta);
            return { isAggregationMode: true, itemsMeta };
        });
    }

    private onCancelAggregateItem = (onDone?: () => void) => {
        LayoutAnimation.easeInEaseOut();
        this.props.header.pop();
        setContextMode(false, this.props.client);
        this.setState((prevState) => {
            const itemsMeta = this.unselectAndEnableItems(prevState.itemsMeta);
            return { isAggregationMode: false, itemsMeta };
        }, onDone);
    }

    private onCommitAggregateItem = async () => {
        const selectedItems = this.getSelectedItems();

        if (selectedItems.length < 2) {
            this.onCancelAggregateItem();
            return;
        }

        let aggregateId;
        const childIds: string[] = [];

        for (const selectedItem of selectedItems) {
            if (selectedItem.__typename === Type.Aggregate) {
                aggregateId = selectedItem.id;
            } else {
                childIds.push(selectedItem.id);
            }
        }

        if (aggregateId) {
            LayoutAnimation.easeInEaseOut();

            try {
                await this.props.onAddItemsToAggregate(
                    childIds, aggregateId);
            } catch (e) {
                // already reported
            }

            this.onCancelAggregateItem();
            return;
        }

        this.onCancelAggregateItem(() => {
            const route = routes.trackableAdd.path.replace(
                ":type", TrackableType.Aggregate.toString());
            const historyState: IHsitoryState = {
                aggregateFormContainer: { trackableIds: childIds },
                stackingSwitch: {
                    animation: StackingSwitchAnimation.SlideInRight,
                },
            };
            this.props.history.push(route, historyState);
        });
    }

    private onStartRemoveItem = (id: string) => {
        const msg = undefined;
        const { formatMessage } = this.props.intl;
        Alert.alert(formatMessage({ id: "common.areYouSure" }), msg, [
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

    private async onCommitRemoveItem(id: string) {
        LayoutAnimation.easeInEaseOut();
        this.props.diContainer.audioManager.play(Sound.Remove);

        try {
            await this.props.onCommitRemoveItem(id);
        } catch (e) {
            return;
        }

        this.setState((prevState) => {
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
        this.openNumericalEntryPopup(async (entry) => {
            if (entry) {
                await this.props.onCommitAddCounterProgress(id, entry);
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

        this.showToast("notifications.goalAchieved", Sound.GoalAchieve);
    }

    private onStartNewGymExerciseEntry = (id: string) => {
        this.openGymExerciseEntryPopup(async (entry) => {
            if (entry) {
                return await this.props.onCommitNewGymExerciseEntry(id, entry);
            }
        });
    }

    private onStartProveItem = async (id: string) => {
        const { diContainer, client } = this.props;
        let image: Image|null;

        try {
            image = await openImgPicker(diContainer.audioManager);
        } catch (e) {
            addGenericErrorToast(client);
            return;
        }

        if (!image) {
            return;
        }

        await this.commitProveItem(id, image);
    }

    private async commitProveItem(id: string, image: Image) {
        this.setItemProving(id, true, async () => {
            let response: IProveTrackableResponse;
            const { client, diContainer, onCommitProveItem } = this.props;

            try {
                response = await onCommitProveItem(id, image);
            } catch (e) {
                if (!isApolloError(e)) {
                    addGenericErrorToast(client);
                }

                return;
            } finally {
                this.setItemProving(id, false);
            }

            await this.tryShareProvedGoal(response);
            let msgId;
            const { status } = response.proveTrackable.trackable;

            if (status === TrackableStatus.Approved) {
                msgId = "notifications.goalApproved";
            } else {
                msgId = "notifications.goalPendingReview";
            }

            this.showToast(msgId, Sound.Approve);
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

    private tryShareProvedGoal(response: IProveTrackableResponse) {
        if (isAnonymous(this.props.session)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const { formatMessage } = this.props.intl;
            const dlgMsg = undefined;
            const dlgTitle = formatMessage({ id: "shareProvedGoal.title" });
            Alert.alert(dlgTitle, dlgMsg, [
                {
                    onPress: resolve,
                    style: "cancel",
                    text: formatMessage({ id: "common.no" }),
                },
                {
                    onPress: async () => {
                        await this.shareProvedGoal(response);
                        resolve();
                    },
                    text: formatMessage({ id: "common.yes" }),
                },
            ]);
        });
    }

    private async shareProvedGoal(response: IProveTrackableResponse) {
        const { client, intl, diContainer } = this.props;
        const fragmentId = dataIdFromObject(response.proveTrackable.trackable)!;
        const title = client.readFragment<IShareProvedGoalFragment>(
            { id: fragmentId, fragment: shareProvedGoalFragment })!.title;

        try {
            await share("share.provedGoal", intl, { title });
        } catch (e) {
            if (!isApolloError(e)) {
                addGenericErrorToast(client);
            }
        }
    }

    private onEditItem = (id: string) => {
        const historyState: IStackingSwitchHistoryState = {
            stackingSwitch: {
                animation: StackingSwitchAnimation.SlideInUp,
            },
        };
        this.props.history.push(
            routes.trackableEdit.path.replace(":id", id), historyState);
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

    private onCommitReorderItem = async (srcId: string, destId: string) => {
        LayoutAnimation.easeInEaseOut();

        try {
            await this.props.onReorderItem(srcId, destId);
        } catch (e) {
            // already reported
        }
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

    private showToast(msgId: string, sound: Sound) {
        const toast = {
            msgId,
            severity: ToastSeverity.Info,
            sound,
        };
        addToast(toast, this.props.client);
    }

    private onSetTaskDone = async (taskId: string, isDone: boolean) => {
        let response;

        try {
            response = await this.props.onSetTaskDone(taskId, isDone);
        } catch (e) {
            return;
        }

        this.tryShowGoalAchievedToast(response.setTaskDone.task.goal.status);
    }

    private isMy() {
        return this.props.match.params.id === defaultId;
    }

    private onIsItemProveable = (status: TrackableStatus) => {
        return status === TrackableStatus.PendingProof && this.isMy();
    }

    private onUnaggregateItem = async (id: string) => {
        try {
            await this.props.onUnaggregateItem(id);
        } catch (e) {
            // already reported
        }
    }

    private onBreakItem = async (id: string) => {
        try {
            await this.props.onBreakItem(id);
        } catch (e) {
            // already reported
        }
    }
}

export default compose(
    withRouter,
    withDIContainer,
    withHeader,
    withSession,
    withNetworkStatus,
    withSyncStatus,
    withFetchPolicy<IActiveTrackableListContainerProps>({
        getNamespace: (props) => props.match.params.id,
        isMyData: (props) => isMyId(props.match.params.id, props.session),
        isReadonlyData: (props) => false,
    }),
    withData,
    withNoUpdatesInBackground,
    withLoader<IActiveTrackableListContainerProps, IGetDataResponse>(Loader, {
        dataField: "getActiveTrackables",
        getQuery: (props) => props.data,
    }),
    withError<IActiveTrackableListContainerProps, IGetDataResponse>(Error, {
        dataField: "getActiveTrackables",
        getQuery: (props) => props.data,
    }),
    withOffline<IActiveTrackableListContainerProps, IGetDataResponse>(Offline, {
        dataField: "getActiveTrackables",
        getQuery: (props) => props.data,
    }),
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
    withAddToAggregate,
    withLoadMore<IActiveTrackableListContainerProps, IGetDataResponse>({
        dataField: "getActiveTrackables",
        getQuery: (props) => props.data,
    }),
    injectIntl,
    withRefresh<IActiveTrackableListContainerProps, IGetDataResponse>({
        dataField: "getActiveTrackables",
        getQuery: (props) => props.data,
        isMyData: (props) => isMyId(props.match.params.id, props.session),
        isReadonlyData: (props) => false,
    }),
    withLoginAction,
    withEnsureUserLoggedIn,
)(ActiveTrackableListContainer);

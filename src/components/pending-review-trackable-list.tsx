import EmptyList from "components/empty-list";
import Loader from "components/loader";
import Trackable, { ITrackableProps } from "components/trackable";
import { IWithRefreshProps } from "components/with-refresh";
import Audience from "models/audience";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import {
    FlatList,
    ListRenderItemInfo,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    View,
} from "react-native";
import makeLog from "utils/make-log";
import QueryStatus from "utils/query-status";

interface ISharedProps {
    audience: Audience;
    onEndReached: () => void;
    onPressUser: (id: string) => void;
    onApproveItem: (id: string) => void;
    onRejectItem: (id: string) => void;
}

interface IItemProps extends ISharedProps {
    id: string;
    title: string;
    iconName: string;
    status: TrackableStatus;
    approveCount: number;
    rejectCount: number;
    creationDate: number;
    statusChangeDate: number;
    proofPhotoUrlMedium: string;
    isReviewable?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
    userId?: string;
    userAvatarUrl?: string;
    userName?: string;
}

interface IPendingReviewTrackableListItemNode {
    id: string;
    title: string;
    iconName: string;
    status: TrackableStatus;
    approveCount: number;
    rejectCount: number;
    creationDate: number;
    statusChangeDate: number;
    proofPhotoUrlMedium: string;
    isReviewed?: boolean;
    user: {
        id: string;
        name: string;
        avatarUrlSmall: string;
    };
}

interface IPendingReviewTrackableListItem {
    node: IPendingReviewTrackableListItemNode;
}

interface IPendingReviewTrackableListProps extends
    ISharedProps, IWithRefreshProps {
    items: IPendingReviewTrackableListItem[];
    queryStatus: QueryStatus;
    onScroll?: (evt?: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const log = makeLog("pending-review-trackable-list");

class PendingReviewTrackableList extends
    React.PureComponent<IPendingReviewTrackableListProps> {
    public render() {
        log.trace("render()");
        const {
            items,
            queryStatus,
            isRefreshing,
            onScroll,
            onEndReached,
            onRefresh,
        } = this.props;
        const loader = queryStatus === QueryStatus.LoadingMore ? Loader : null;
        return (
            <View style={styles.container}>
                <FlatList
                    windowSize={4}
                    initialNumToRender={2}
                    refreshing={isRefreshing}
                    contentContainerStyle={styles.listContent}
                    style={styles.list}
                    data={items}
                    keyExtractor={this.getItemKey}
                    renderItem={this.onRenderItem}
                    ListFooterComponent={loader}
                    onEndReachedThreshold={0.5}
                    onEndReached={onEndReached}
                    onScroll={onScroll}
                    onRefresh={onRefresh}
                />
            </View>
        );
    }

    private onRenderItem = (
        itemInfo: ListRenderItemInfo<IPendingReviewTrackableListItem>,
    ) => {
        const {
            items,
            audience,
            onApproveItem,
            onEndReached,
            onPressUser,
            onRejectItem,
        } = this.props;
        const { index } = itemInfo;
        const { user, isReviewed, ...restProps } = itemInfo.item.node;
        const isMy = audience === Audience.Me;
        return (
            <Item
                userId={isMy ? undefined : user.id}
                userName={isMy ? undefined : user.name}
                userAvatarUrl={isMy ? undefined : user.avatarUrlSmall}
                isReviewable={!isMy && !isReviewed}
                isFirst={!index}
                isLast={index === items.length - 1}
                audience={audience}
                onApproveItem={onApproveItem}
                onEndReached={onEndReached}
                onPressUser={onPressUser}
                onRejectItem={onRejectItem}
                {...restProps}
            />);
    }

    private getItemKey(item: IPendingReviewTrackableListItem) {
        return item.node.id;
    }
}

// tslint:disable-next-line:max-classes-per-file
class Item extends React.PureComponent<IItemProps> {
    public render() {
        const {
            id,
            title,
            iconName,
            status,
            approveCount,
            rejectCount,
            creationDate,
            statusChangeDate,
            proofPhotoUrlMedium,
            userId,
            userName,
            userAvatarUrl,
            audience,
            isReviewable,
            isFirst,
            isLast,
            onPressUser,
            onApproveItem,
            onRejectItem,
        } = this.props;
        const isMy = audience === Audience.Me;
        return (
            <Trackable
                userId={userId}
                userName={userName}
                userAvatarUrl={userAvatarUrl}
                isReviewable={isReviewable}
                isFirst={isFirst}
                isLast={isLast}
                id={id}
                title={title}
                iconName={iconName}
                status={status}
                approveCount={approveCount}
                rejectCount={rejectCount}
                duration={statusChangeDate - creationDate}
                proofPhotoUrl={proofPhotoUrlMedium}
                onPressUser={onPressUser}
                onApprove={onApproveItem}
                onReject={onRejectItem}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        backgroundColor: "#edf0f5",
    },
    listContent: {},
});

export { IPendingReviewTrackableListItemNode };
export default PendingReviewTrackableList;

import EmptyList from "components/empty-list";
import Loader from "components/loader";
import Trackable, { ITrackableProps } from "components/trackable";
import Audience from "models/audience";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import QueryStatus from "utils/query-status";

interface ISharedProps {
    audience: Audience;
    onEndReached: () => void;
    onPressUser: (id: string) => void;
    onApproveItem: (id: string) => void;
    onRejectItem: (id: string) => void;
}

interface IItemProps extends
    IPendingReviewTrackableListItemNode, ISharedProps {}

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

interface IPendingReviewTrackableListProps extends ISharedProps {
    items: IPendingReviewTrackableListItem[];
    queryStatus: QueryStatus;
}

class PendingReviewTrackableList extends
    React.Component<IPendingReviewTrackableListProps> {
    public render() {
        const { items, queryStatus, onEndReached } = this.props;
        const loader = queryStatus === QueryStatus.LoadingMore ? Loader : null;
        return (
            <FlatList
                windowSize={4}
                initialNumToRender={2}
                contentContainerStyle={styles.listContent}
                data={items}
                keyExtractor={this.getItemKey}
                renderItem={this.onRenderItem}
                ListFooterComponent={loader}
                onEndReachedThreshold={0.5}
                onEndReached={onEndReached}
            />
        );
    }

    private onRenderItem = (
        itemInfo: ListRenderItemInfo<IPendingReviewTrackableListItem>,
    ) => {
        const {
            audience,
            onApproveItem,
            onEndReached,
            onPressUser,
            onRejectItem,
        } = this.props;
        return (
            <Item
                {...itemInfo.item.node}
                audience={audience}
                onApproveItem={onApproveItem}
                onEndReached={onEndReached}
                onPressUser={onPressUser}
                onRejectItem={onRejectItem}
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
            user,
            audience,
            isReviewed,
            onPressUser,
            onApproveItem,
            onRejectItem,
        } = this.props;
        const isMy = audience === Audience.Me;
        return (
            <Trackable
                userId={isMy ? undefined : user.id}
                userName={isMy ? undefined : user.name}
                userAvatarUrl={isMy ? undefined : user.avatarUrlSmall}
                isReviewable={!isMy && !isReviewed}
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
    listContent: {
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
    },
});

export { IPendingReviewTrackableListItemNode };
export default PendingReviewTrackableList;

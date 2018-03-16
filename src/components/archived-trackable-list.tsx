import EmptyList from "components/empty-list";
import FadeIn from "components/fade-in";
import Loader from "components/loader";
import ProgressBar from "components/progress-bar";
import Trackable, { ITrackableProps } from "components/trackable";
import { IWithRefreshProps } from "components/with-refresh";
import ProgressDisplayMode from "models/progress-display-mode";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, Text } from "react-native";
import * as Animatable from "react-native-animatable";
import QueryStatus from "utils/query-status";

interface IItemProps extends IArchivedTrackableListItemNode {
    isFirst?: boolean;
    isLast?: boolean;
    onGetStatusDuration: IArchivedTrackableListOnGetStatusDuration;
}

type IArchivedTrackableListOnGetStatusDuration = (
    status: TrackableStatus,
    statusChangeDate: number,
    creationDate: number,
    achievementDate?: number,
) => number;

interface IArchivedTrackableListItem {
    node: IArchivedTrackableListItemNode;
}

interface IArchivedTrackableListItemNode {
    id: string;
    progress: number;
    maxProgress: number;
    progressDisplayMode: ProgressDisplayMode;
    title: string;
    iconName: string;
    status: TrackableStatus;
    rating?: number;
    approveCount?: number;
    rejectCount?: number;
    creationDate: number;
    statusChangeDate: number;
    achievementDate?: number;
    proofPhotoUrlMedium?: string;
}

interface IArchivedTrackableListProps extends IWithRefreshProps {
    items: IArchivedTrackableListItem[];
    queryStatus: QueryStatus;
    trackableStatus: TrackableStatus;
    onEndReached: () => void;
    onGetStatusDuration: IArchivedTrackableListOnGetStatusDuration;
}

class ArchivedTrackableList extends
    React.PureComponent<IArchivedTrackableListProps> {
    public render() {
        const { items, queryStatus, isRefreshing, onEndReached, onRefresh } =
            this.props;
        const loader = queryStatus === QueryStatus.LoadingMore ? Loader : null;
        return (
            <FadeIn>
                <FlatList
                    windowSize={4}
                    initialNumToRender={4}
                    refreshing={isRefreshing}
                    contentContainerStyle={styles.listContent}
                    style={styles.list}
                    data={items}
                    keyExtractor={this.getItemKey}
                    renderItem={this.onRenderItem}
                    ListFooterComponent={loader}
                    onEndReachedThreshold={0.5}
                    onEndReached={onEndReached}
                    onRefresh={onRefresh}
                />
            </FadeIn>
        );
    }

    private onRenderItem = (
        itemInfo: ListRenderItemInfo<IArchivedTrackableListItem>,
    ) => {
        const { index } = itemInfo;
        const { items, onGetStatusDuration } = this.props;
        const isFirst = !index;
        const isLast = index === items.length - 1;
        return (
            <Item
                {...itemInfo.item.node}
                isFirst={isFirst}
                isLast={isLast}
                onGetStatusDuration={onGetStatusDuration}
            />
        );
    }

    private getItemKey(item: IArchivedTrackableListItem) {
        return item.node.id;
    }
}

// tslint:disable-next-line:max-classes-per-file
class Item extends React.PureComponent<IItemProps> {
    public render() {
        const {
            id,
            progress,
            maxProgress,
            progressDisplayMode,
            title,
            iconName,
            status,
            rating,
            approveCount,
            rejectCount,
            creationDate,
            statusChangeDate,
            achievementDate,
            proofPhotoUrlMedium,
            isFirst,
            isLast,
            onGetStatusDuration,
        } = this.props;
        const progressBar = progress !== maxProgress && (
            <ProgressBar
                value={progress}
                maxValue={maxProgress}
                mode={progressDisplayMode}
            />
        );
        const statusDuration = onGetStatusDuration(
            status, statusChangeDate, creationDate, achievementDate);
        return (
            <Trackable
                id={id}
                title={title}
                iconName={iconName}
                status={status}
                rating={rating}
                approveCount={approveCount}
                rejectCount={rejectCount}
                statusDuration={statusDuration}
                proofPhotoUrl={proofPhotoUrlMedium}
                isFirst={isFirst}
                isLast={isLast}
            >
                {progressBar}
            </Trackable>
        );
    }
}

const styles = StyleSheet.create({
    list: {},
    listContent: {},
});

export {
    IArchivedTrackableListItem,
    IArchivedTrackableListItemNode,
    IArchivedTrackableListOnGetStatusDuration,
};
export default ArchivedTrackableList;

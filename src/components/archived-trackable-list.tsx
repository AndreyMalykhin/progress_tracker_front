import EmptyList from "components/empty-list";
import Loader from "components/loader";
import ProgressBar from "components/progress-bar";
import Trackable from "components/trackable";
import ProgressDisplayMode from "models/progress-display-mode";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, Text } from "react-native";
import QueryStatus from "utils/query-status";

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
    proofPhotoUrlMedium?: string;
}

interface IArchivedTrackableListProps {
    items: IArchivedTrackableListItem[];
    queryStatus: QueryStatus;
    onEndReached: () => void;
}

class ArchivedTrackableList extends
    React.Component<IArchivedTrackableListProps> {
    public render() {
        const { items, queryStatus, onEndReached } = this.props;

        if (!items.length) {
            return <EmptyList />;
        }

        const loader = queryStatus === QueryStatus.LoadingMore ? Loader : null;
        return (
            <FlatList
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
        itemInfo: ListRenderItemInfo<IArchivedTrackableListItem>,
    ) => {
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
            proofPhotoUrlMedium,
        } = itemInfo.item.node;
        let progressBar;

        if (progress !== maxProgress) {
            progressBar = (
                <ProgressBar
                    value={progress}
                    maxValue={maxProgress}
                    mode={progressDisplayMode}
                />
            );
        }

        return (
            <Trackable
                id={id}
                title={title}
                iconName={iconName}
                status={status}
                rating={rating}
                approveCount={approveCount}
                rejectCount={rejectCount}
                duration={statusChangeDate - creationDate}
                proofPhotoUrl={proofPhotoUrlMedium}
            >
                {progressBar}
            </Trackable>
        );
    }

    private getItemKey(item: IArchivedTrackableListItem) {
        return item.node.id;
    }
}

const styles = StyleSheet.create({
    listContent: {
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
    },
});

export { IArchivedTrackableListItem, IArchivedTrackableListItemNode };
export default ArchivedTrackableList;

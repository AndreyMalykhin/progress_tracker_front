import EmptyList from "components/empty-list";
import Loader from "components/loader";
import ProgressBar from "components/progress-bar";
import Trackable, { ITrackableProps } from "components/trackable";
import { IWithRefreshProps } from "components/with-refresh";
import ProgressDisplayMode from "models/progress-display-mode";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, Text } from "react-native";
import QueryStatus from "utils/query-status";

type IItemProps = IArchivedTrackableListItemNode;

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

interface IArchivedTrackableListProps extends IWithRefreshProps {
    items: IArchivedTrackableListItem[];
    queryStatus: QueryStatus;
    trackableStatus: TrackableStatus;
    onEndReached: () => void;
}

class ArchivedTrackableList extends
    React.PureComponent<IArchivedTrackableListProps> {
    public render() {
        const { items, queryStatus, isRefreshing, onEndReached, onRefresh } =
            this.props;
        const loader = queryStatus === QueryStatus.LoadingMore ? Loader : null;
        return (
            <FlatList
                windowSize={4}
                initialNumToRender={4}
                refreshing={isRefreshing}
                contentContainerStyle={styles.listContent}
                data={items}
                keyExtractor={this.getItemKey}
                renderItem={this.onRenderItem}
                ListFooterComponent={loader}
                onEndReachedThreshold={0.5}
                onEndReached={onEndReached}
                onRefresh={onRefresh}
            />
        );
    }

    private onRenderItem = (
        itemInfo: ListRenderItemInfo<IArchivedTrackableListItem>,
    ) => {
        return <Item {...itemInfo.item.node} />;
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
            proofPhotoUrlMedium,
        } = this.props;
        const progressBar = progress !== maxProgress && (
            <ProgressBar
                value={progress}
                maxValue={maxProgress}
                mode={progressDisplayMode}
            />
        );

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

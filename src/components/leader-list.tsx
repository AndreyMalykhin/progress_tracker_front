import Avatar from "components/avatar";
import Loader from "components/loader";
import Text from "components/text";
import TouchableWithFeedback from "components/touchable-with-feedback";
import { IWithRefreshProps } from "components/with-refresh";
import * as React from "react";
import {
    FlatList,
    ListRenderItemInfo,
    StyleSheet,
    View,
} from "react-native";
import QueryStatus from "utils/query-status";

interface ILeaderListProps extends IWithRefreshProps {
    items: ILeaderListItem[];
    queryStatus: QueryStatus;
    onEndReached: () => void;
    onPressItem: (id: string) => void;
}

interface IItemProps extends ILeaderListItemNode {
    index: number;
    onPress: (id: string) => void;
}

interface ILeaderListItem {
    node: ILeaderListItemNode;
}

interface ILeaderListItemNode {
    id: string;
    name: string;
    rating: number;
    avatarUrlSmall: string;
}

class LeaderList extends React.Component<ILeaderListProps> {
    public render() {
        const { items, queryStatus, isRefreshing, onEndReached, onRefresh } =
            this.props;
        const loader = queryStatus === QueryStatus.LoadingMore ? Loader : null;
        return (
            <FlatList
                windowSize={10}
                initialNumToRender={8}
                refreshing={isRefreshing}
                data={items}
                keyExtractor={this.getItemKey}
                renderItem={this.onRenderItem}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={loader}
                onEndReachedThreshold={0.5}
                onEndReached={onEndReached}
                onRefresh={onRefresh}
            />
        );
    }

    private getItemKey(item: ILeaderListItem) {
        return item.node.id;
    }

    private onRenderItem = (
        itemInfo: ListRenderItemInfo<ILeaderListItem>,
    ) => {
        const { onPressItem } = this.props;
        return (
            <Item
                {...itemInfo.item.node}
                index={itemInfo.index}
                onPress={onPressItem}
            />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class Item extends React.PureComponent<IItemProps> {
    public render() {
        const { name, avatarUrlSmall, rating, index } = this.props;
        return (
            <TouchableWithFeedback
                style={styles.item}
                onPress={this.onPress}
            >
                <View style={styles.itemUser}>
                    <Text style={styles.itemUserIndex}>{index + 1}</Text>
                    <Avatar
                        style={styles.itemUserAvatar}
                        size="medium"
                        uri={avatarUrlSmall}
                    />
                    <Text style={styles.itemUserName} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={styles.itemUserRating}>{rating}</Text>
                </View>
            </TouchableWithFeedback>
        );
    }

    private onPress = () => this.props.onPress(this.props.id);
}

const styles = StyleSheet.create({
    item: {
        paddingBottom: 32,
    },
    itemUser: {
        alignItems: "center",
        flexDirection: "row",
    },
    itemUserAvatar: {
        marginLeft: 8,
        marginRight: 8,
    },
    itemUserIndex: {
        fontSize: 24,
        textAlign: "center",
        width: 48,
    },
    itemUserName: {
        flex: 1,
        lineHeight: 48,
    },
    itemUserRating: {
        fontWeight: "bold",
        lineHeight: 48,
        marginLeft: 8,
    },
    listContent: {
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
    },
});

export { ILeaderListItemNode };
export default LeaderList;

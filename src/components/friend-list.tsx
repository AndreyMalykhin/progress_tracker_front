import Avatar from "components/avatar";
import Button, { ButtonIcon, ButtonTitle } from "components/button";
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
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import makeLog from "utils/make-log";
import QueryStatus from "utils/query-status";

interface IFriendListProps extends IWithRefreshProps {
    items: IFriendListItem[];
    queryStatus: QueryStatus;
    onEndReached: () => void;
    onSetItemMuted: (id: string, isMuted: boolean) => void;
    onPressItem: (id: string) => void;
}

interface IItemProps extends IFriendListItemNode {
    onPress: (id: string) => void;
    onSetMuted: (id: string, isMuted: boolean) => void;
}

interface IFriendListItem {
    node: IFriendListItemNode;
}

interface IFriendListItemNode {
    id: string;
    name: string;
    avatarUrlSmall: string;
    isMuted: boolean;
}

const log = makeLog("friend-list");

class FriendList extends React.PureComponent<IFriendListProps> {
    public render() {
        log.trace("render()");
        const { items, queryStatus, isRefreshing, onEndReached, onRefresh } =
            this.props;
        const loader = queryStatus === QueryStatus.LoadingMore ? Loader : null;
        return (
            <FlatList
                windowSize={12}
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

    private getItemKey(item: IFriendListItem) {
        return item.node.id;
    }

    private onRenderItem = (
        itemInfo: ListRenderItemInfo<IFriendListItem>,
    ) => {
        const { onSetItemMuted, onPressItem } = this.props;
        return (
            <Item
                onSetMuted={onSetItemMuted}
                onPress={onPressItem}
                {...itemInfo.item.node}
            />
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class Item extends React.PureComponent<IItemProps> {
    public render() {
        const { isMuted, name, avatarUrlSmall } = this.props;
        const muteBtnStyle =
            isMuted ? styles.itemMuteBtnActive : null;
        return (
            <View style={styles.item}>
                <TouchableWithFeedback
                    style={styles.itemUser}
                    onPress={this.onPress}
                >
                    <View style={styles.itemUser}>
                        <Avatar
                            style={styles.itemUserAvatar}
                            size="medium"
                            uri={avatarUrlSmall}
                        />
                        <Text style={styles.itemUserName} numberOfLines={1}>
                            {name}
                        </Text>
                    </View>
                </TouchableWithFeedback>
                <Button style={styles.itemMuteBtn} onPress={this.onSetMuted}>
                    <ButtonIcon
                        style={muteBtnStyle}
                        name={isMuted ? "volume-off" : "volume-high"}
                        component={Icon}
                    />
                </Button>
            </View>
        );
    }

    private onPress = () => this.props.onPress(this.props.id);

    private onSetMuted = () =>
        this.props.onSetMuted(this.props.id, !this.props.isMuted)
}

const styles = StyleSheet.create({
    item: {
        alignItems: "center",
        flexDirection: "row",
        paddingBottom: 32,
    },
    itemMuteBtn: {
        paddingLeft: 8,
    },
    itemMuteBtnActive: {
        color: "#ff3b30",
    },
    itemUser: {
        flex: 1,
        flexDirection: "row",
    },
    itemUserAvatar: {
        marginRight: 8,
    },
    itemUserName: {
        flex: 1,
        lineHeight: 48,
    },
    listContent: {
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
    },
});

export { IFriendListItemNode };
export default FriendList;

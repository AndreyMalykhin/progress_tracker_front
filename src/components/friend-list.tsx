import Avatar from "components/avatar";
import Button, { ButtonIcon, ButtonTitle } from "components/button";
import {
    avatarStyle,
    cardStyle,
    gap,
    iconStyle,
    severityColor,
    stateColor,
    userListContentStyle,
    userListItemStyle,
} from "components/common-styles";
import FadeIn from "components/fade-in";
import Icon from "components/icon";
import Loader from "components/loader";
import Text from "components/text";
import TouchableWithFeedback from "components/touchable-with-feedback";
import { BodyText } from "components/typography";
import { IWithRefreshProps } from "components/with-refresh";
import * as React from "react";
import {
    FlatList,
    ListRenderItemInfo,
    StyleSheet,
    View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import IconName from "utils/icon-name";
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
        log.trace("render");
        const { items, queryStatus, isRefreshing, onEndReached, onRefresh } =
            this.props;
        const loader = queryStatus === QueryStatus.LoadingMore ? Loader : null;
        return (
            <FadeIn style={styles.container}>
                <FlatList
                    windowSize={12}
                    initialNumToRender={8}
                    refreshing={isRefreshing}
                    data={items}
                    keyExtractor={this.getItemKey}
                    renderItem={this.onRenderItem}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    ListFooterComponent={loader}
                    onEndReachedThreshold={0.5}
                    onEndReached={onEndReached}
                    onRefresh={onRefresh}
                />
            </FadeIn>
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
                        <BodyText style={styles.itemUserName} numberOfLines={1}>
                            {name}
                        </BodyText>
                    </View>
                </TouchableWithFeedback>
                <Button style={styles.itemMuteBtn} onPress={this.onSetMuted}>
                    <ButtonIcon
                        disabled={isMuted}
                        active={!isMuted}
                        name={isMuted ? IconName.Muted : IconName.Unmuted}
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
    container: {
        flex: 1,
    },
    item: {
        ...userListItemStyle,
        alignItems: "center",
        flexDirection: "row",
    },
    itemMuteBtn: {
        paddingLeft: gap.single,
    },
    itemUser: {
        flex: 1,
        flexDirection: "row",
    },
    itemUserAvatar: {
        marginRight: gap.single,
    },
    itemUserName: {
        flex: 1,
        lineHeight: avatarStyle.medium.height,
    },
    list: {
        backgroundColor: cardStyle.backgroundColor,
        flex: 1,
    },
    listContent: {
        ...userListContentStyle,
    },
});

export { IFriendListItemNode };
export default FriendList;

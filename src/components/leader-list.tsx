import Avatar from "components/avatar";
import {
    AvatarStyle,
    CardStyle,
    Color,
    FontWeightStyle,
    Gap,
    rem,
    UserListContentStyle,
    UserListItemStyle,
} from "components/common-styles";
import Loader from "components/loader";
import Text from "components/text";
import TouchableWithFeedback from "components/touchable-with-feedback";
import {
    BodyText,
    CalloutText,
    Caption1Text,
    LargeTitleText,
    Title1Text,
    Title2Text,
} from "components/typography";
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
                    <Title2Text style={styles.itemUserIndex}>
                        {index + 1}
                    </Title2Text>
                    <Avatar
                        style={styles.itemUserAvatar}
                        size="medium"
                        uri={avatarUrlSmall}
                    />
                    <BodyText style={styles.itemUserName} numberOfLines={1}>
                        {name}
                    </BodyText>
                    <Caption1Text style={styles.itemUserRating}>
                        {rating}
                    </Caption1Text>
                </View>
            </TouchableWithFeedback>
        );
    }

    private onPress = () => this.props.onPress(this.props.id);
}

const itemHeight = AvatarStyle.medium.height;

const styles = StyleSheet.create({
    item: {
        ...UserListItemStyle,
    },
    itemUser: {
        alignItems: "center",
        flexDirection: "row",
    },
    itemUserAvatar: {
        marginLeft: Gap.single,
        marginRight: Gap.single,
    },
    itemUserIndex: {
        ...FontWeightStyle.bold,
        lineHeight: itemHeight,
        textAlign: "center",
        width: rem(4.8),
    },
    itemUserName: {
        flex: 1,
        lineHeight: itemHeight,
    },
    itemUserRating: {
        color: Color.grayDark,
        lineHeight: itemHeight,
        marginLeft: Gap.single,
    },
    list: {
        backgroundColor: CardStyle.backgroundColor,
    },
    listContent: {
        ...UserListContentStyle,
    },
});

export { ILeaderListItemNode };
export default LeaderList;

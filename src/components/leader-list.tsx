import Avatar from "components/avatar";
import {
    avatarStyle,
    cardStyle,
    color,
    fontWeightStyle,
    gap,
    rem,
    userListContentStyle,
    userListItemStyle,
} from "components/common-styles";
import FadeIn from "components/fade-in";
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
import { FormattedNumber } from "react-intl";
import {
    FlatList,
    ListRenderItemInfo,
    StyleSheet,
    View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { NumberFormat } from "utils/formats";
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
                        <FormattedNumber
                            value={rating}
                            format={NumberFormat.Absolute}
                        />
                    </Caption1Text>
                </View>
            </TouchableWithFeedback>
        );
    }

    private onPress = () => this.props.onPress(this.props.id);
}

const itemHeight = avatarStyle.medium.height;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    item: {
        ...userListItemStyle,
    },
    itemUser: {
        alignItems: "center",
        flexDirection: "row",
    },
    itemUserAvatar: {
        marginLeft: gap.single,
        marginRight: gap.single,
    },
    itemUserIndex: {
        ...fontWeightStyle.bold,
        lineHeight: itemHeight,
        textAlign: "center",
        width: rem(4.8),
    },
    itemUserName: {
        flex: 1,
        lineHeight: itemHeight,
    },
    itemUserRating: {
        color: color.grayDark,
        lineHeight: itemHeight,
        marginLeft: gap.single,
    },
    list: {
        backgroundColor: cardStyle.backgroundColor,
        flex: 1,
    },
    listContent: {
        ...userListContentStyle,
    },
});

export { ILeaderListItemNode };
export default LeaderList;

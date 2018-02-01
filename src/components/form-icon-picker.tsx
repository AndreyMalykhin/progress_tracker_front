import Button, { ButtonIcon } from "components/button";
import { FormGroup, FormLabel } from "components/form";
import * as React from "react";
import {
    Dimensions,
    FlatList,
    ListRenderItemInfo,
    StyleSheet,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface IFormIconPickerExpandedProps {
    availableIconNames: string[];
    iconName: string;
    onSelect: (iconName: string) => void;
}

interface IFormIconPickerCollapsedProps {
    iconName: string;
    onExpand: () => void;
}

interface IListItemProps {
    iconName: string;
    isSelected?: boolean;
    onPress: (iconName: string) => void;
}

class FormIconPickerExpanded extends
    React.PureComponent<IFormIconPickerExpandedProps> {
    public render() {
        const columnCount = Math.floor(Dimensions.get("window").width / 80);
        return (
            <FlatList
                key={columnCount}
                numColumns={columnCount}
                data={this.props.availableIconNames}
                renderItem={this.renderItem}
                keyExtractor={this.getItemKey}
                contentContainerStyle={styles.expandedList}
            />
        );
    }

    private renderItem = (info: ListRenderItemInfo<string>) => {
        return (
            <ListItem
                iconName={info.item}
                isSelected={this.props.iconName === info.item}
                onPress={this.props.onSelect}
            />
        );
    }

    private getItemKey(item: string) {
        return item;
    }
}

// tslint:disable-next-line:max-classes-per-file
class ListItem extends React.PureComponent<IListItemProps> {
    public render() {
        const style = this.props.isSelected ? expandedIconSelectedStyle
            : styles.expandedListItemIcon;
        return (
            <View style={styles.expandedListItem}>
                <Icon
                    size={48}
                    name={this.props.iconName}
                    style={style}
                    onPress={this.onPress}
                />
            </View>
        );
    }

    private onPress = () => {
        this.props.onPress(this.props.iconName);
    }
}

// tslint:disable-next-line:max-classes-per-file
class FormIconPickerCollapsed extends
    React.PureComponent<IFormIconPickerCollapsedProps> {
    public render() {
        const { iconName, onExpand } = this.props;
        return (
            <FormGroup
                horizontal={true}
                labelMsgId="trackableForm.iconLabel"
                style={styles.collapsedContainer}
            >
                <Button onPress={onExpand}>
                    <ButtonIcon component={Icon} name={iconName} />
                </Button>
            </FormGroup>
        );
    }
}

const styles = StyleSheet.create({
    collapsedContainer: {},
    collapsedIcon: {
        color: "#0076ff",
    },
    expandedList: {
        alignSelf: "center",
    },
    expandedListItem: {},
    expandedListItemIcon: {
        padding: 16,
    },
    expandedListItemIconSelected: {
        color: "#0076ff",
    },
});

const expandedIconSelectedStyle =
    [styles.expandedListItemIcon, styles.expandedListItemIconSelected];

export { FormIconPickerExpanded, FormIconPickerCollapsed };

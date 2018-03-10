import Button, { ButtonIcon } from "components/button";
import { Gap, TouchableStyle } from "components/common-styles";
import { FormGroup, FormLabel } from "components/form";
import Icon from "components/icon";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import * as React from "react";
import {
    Dimensions,
    FlatList,
    ListRenderItemInfo,
    StyleSheet,
    View,
} from "react-native";
import Sound from "utils/sound";

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
    React.PureComponent<IFormIconPickerExpandedProps & IWithDIContainerProps> {
    public render() {
        const columnWidth =
            (expandedListItemIconPadding * 2) + expandedListItemIconSize;
        const columnCount =
            Math.floor(Dimensions.get("window").width / columnWidth);
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
                onPress={this.onSelectItem}
            />
        );
    }

    private onSelectItem = (iconName: string) => {
        this.props.diContainer.audioManager.play(Sound.Click);
        this.props.onSelect(iconName);
    }

    private getItemKey(item: string) {
        return item;
    }
}

const EnchanchedFormIconPickerExpanded =
    withDIContainer(FormIconPickerExpanded);

// tslint:disable-next-line:max-classes-per-file
class ListItem extends React.PureComponent<IListItemProps> {
    public render() {
        return (
            <View style={styles.expandedListItem}>
                <Icon
                    active={this.props.isSelected}
                    size={expandedListItemIconSize}
                    name={this.props.iconName}
                    style={styles.expandedListItemIcon}
                    onPress={this.onPress}
                />
            </View>
        );
    }

    private onPress = () => this.props.onPress(this.props.iconName);
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

const expandedListItemIconSize = TouchableStyle.minHeight;
const expandedListItemIconPadding = Gap.double;

const styles = StyleSheet.create({
    collapsedContainer: {},
    expandedList: {
        alignSelf: "center",
    },
    expandedListItem: {},
    expandedListItemIcon: {
        paddingBottom: expandedListItemIconPadding,
        paddingLeft: expandedListItemIconPadding,
        paddingRight: expandedListItemIconPadding,
        paddingTop: expandedListItemIconPadding,
    },
});

export {
    EnchanchedFormIconPickerExpanded as FormIconPickerExpanded,
    FormIconPickerCollapsed,
};

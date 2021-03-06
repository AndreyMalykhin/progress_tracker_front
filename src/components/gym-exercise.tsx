import { ICommandBarItem } from "components/command-bar";
import {
    fontWeightStyle,
    gap,
    typographyStyle,
} from "components/common-styles";
import Text from "components/text";
import TouchableWithFeedback from "components/touchable-with-feedback";
import Trackable from "components/trackable";
import {
    BodyText,
    CalloutText,
    Caption1Text,
    SubheadText,
} from "components/typography";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { FormattedDate, FormattedMessage } from "react-intl";
import {
    LayoutRectangle,
    StyleProp,
    StyleSheet,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

interface IGymExerciseItem {
    date: number;
    entries: IGymExerciseEntry[];
}

interface ITableProps {
    items: IGymExerciseItem[];
    isExpanded?: boolean;
}

interface IGymExerciseEntry {
    id: string;
    date: number;
    setCount: number;
    repetitionCount: number;
    weight: number;
}

interface IGymExerciseProps {
    index?: number;
    id: string;
    status: TrackableStatus;
    isBatchEditMode?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
    isReorderMode?: boolean;
    isDragged?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
    commands?: ICommandBarItem[];
    statusDuration?: number;
    style?: StyleProp<ViewStyle>;
    iconName: string;
    title: string;
    isExpanded?: boolean;
    isExpandable?: boolean;
    items: IGymExerciseItem[];
    onExpandChange: (id: string, isExpanded: boolean) => void;
    onSelectChange?: (id: string, isSelected: boolean) => void;
    onLongPress?: (id: string, parentId?: string) => void;
    onPressOut?: (id: string) => void;
    onPressProgress?: (id: string) => void;
    onLayout?: (id: string, layout?: LayoutRectangle) => void;
}

class GymExercise extends React.PureComponent<IGymExerciseProps> {
    public render() {
        const { items, isExpanded, isDisabled, onPressProgress, ...restProps } =
            this.props;
        const table = items.length ? (
            <TouchableWithFeedback
                disabled={isDisabled || !onPressProgress}
                onPress={this.onPressProgress}
            >
                <Table items={items} isExpanded={isExpanded} />
            </TouchableWithFeedback>
        ) : null;
        return (
            <Trackable
                isExpanded={isExpanded}
                isDisabled={isDisabled}
                {...restProps}
            >
                {table}
            </Trackable>
        );
    }

    private onPressProgress = () => {
        const { onPressProgress, id } = this.props;
        onPressProgress!(id);
    }
}

// tslint:disable-next-line:max-classes-per-file
class Table extends React.PureComponent<ITableProps> {
    public render() {
        return (
            <View style={styles.table}>
                {this.renderHeader()}
                {this.renderBody()}
            </View>
        );
    }

    private renderHeader() {
        const cells = this.props.items.map((item) => {
            const cellContent = item.entries.length ? (
                <FormattedDate
                    value={item.date}
                    weekday="short"
                    day="numeric"
                />
            ) : "---";
            const inHeader = true;
            return this.renderCell(cellContent, item.date, inHeader);
        });
        return <View style={styles.tableHeader}>{cells}</View>;
    }

    private renderBody() {
        return (
            <View style={styles.tableBody}>
                {this.props.items.map(this.renderColumn)}
            </View>
        );
    }

    private renderColumn = (item: IGymExerciseItem) => {
        const cells = [];

        if (item.entries.length) {
            if (this.props.isExpanded) {
                for (const entry of item.entries) {
                    const { id, setCount, repetitionCount, weight } = entry;

                    for (let i = 0; i < setCount; ++i) {
                        const inHeader = false;
                        const key = `${id}_${i}`;
                        const cell = this.renderCell(
                            this.renderEntry(repetitionCount, weight),
                            key,
                            inHeader,
                        );
                        cells.push(cell);
                    }
                }
            } else {
                const { id, setCount, repetitionCount, weight } =
                    item.entries[0];
                const inHeader = false;
                const cell = this.renderCell(
                    this.renderEntry(repetitionCount, weight, setCount),
                    id,
                    inHeader,
                );
                cells.push(cell);
            }
        }

        return (
            <View key={item.date} style={styles.tableColumn}>
                {cells}
            </View>
        );
    }

    private renderCell(
        content: string|JSX.Element, key: string|number, inHeader: boolean,
    ) {
        const Component = inHeader ? Caption1Text : CalloutText;
        const style = inHeader ? tableHeaderCellStyle : styles.tableCell;
        return <Component key={key} style={style}>{content}</Component>;
    }

    private renderEntry(
        repetitionCount: number, weight: number, setCount?: number,
    ) {
        const values = {
            hasSetCount: setCount != null,
            repetitionCount,
            setCount,
            weight,
        };
        const msgId = this.props.isExpanded ? "gymExercise.entry" :
            "gymExercise.entryAveraged";
        return <FormattedMessage id={msgId} values={values} />;
    }
}

const styles = StyleSheet.create({
    table: {
        paddingBottom: gap.single,
        paddingTop: gap.single,
    },
    tableBody: {
        flexDirection: "row",
    },
    tableCell: {
        paddingLeft: gap.half,
        paddingRight: gap.half,
        textAlign: "center",
    },
    tableCellHeader: {
        flex: 1,
    },
    tableColumn: {
        flex: 1,
    },
    tableHeader: {
        flexDirection: "row",
        paddingBottom: gap.single,
    },
});

const tableHeaderCellStyle = [styles.tableCell, styles.tableCellHeader];

export { IGymExerciseProps, IGymExerciseEntry, IGymExerciseItem };
export default GymExercise;

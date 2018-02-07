import { ICommandBarItem } from "components/command-bar";
import Trackable from "components/trackable";
import ITrackableBaseProps from "components/trackable-base-props";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { FormattedDate } from "react-intl";
import {
    LayoutRectangle,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
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

interface IGymExerciseProps extends ITrackableBaseProps {
    iconName: string;
    title: string;
    isExpanded?: boolean;
    isExpandable?: boolean;
    items: IGymExerciseItem[];
    onExpandChange: (id: string, isExpanded: boolean) => void;
}

class GymExercise extends React.PureComponent<IGymExerciseProps> {
    public render() {
        const { items, isExpanded, ...restProps } = this.props;
        return (
            <Trackable isExpanded={isExpanded} {...restProps}>
                <Table items={items} isExpanded={isExpanded} />
            </Trackable>
        );
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
            const cellContent = item.entries.length ?
                <FormattedDate value={item.date} weekday="short" /> : "---";
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
                        cells.push(this.renderCell(
                            `${repetitionCount}x${weight}`, key, inHeader));
                    }
                }
            } else {
                const { id, setCount, repetitionCount, weight } =
                    item.entries[0];
                const inHeader = false;
                cells.push(this.renderCell(
                    `${setCount}x${repetitionCount.toFixed(1)}x${weight.toFixed(1)}`,
                    id,
                    inHeader,
                ));
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
        const style = inHeader ? tableHeaderCellStyle : styles.tableCell;
        return <Text key={key} style={style}>{content}</Text>;
    }
}

const styles = StyleSheet.create({
    table: {
        marginBottom: 8,
    },
    tableBody: {
        flexDirection: "row",
    },
    tableCell: {
        flex: 1,
        fontSize: 8,
        lineHeight: 16,
        paddingLeft: 8,
        paddingRight: 8,
        textAlign: "center",
    },
    tableCellHeader: {
        fontSize: 12,
        fontWeight: "bold",
        lineHeight: 32,
    },
    tableColumn: {
        flex: 1,
    },
    tableHeader: {
        flexDirection: "row",
    },
});

const tableHeaderCellStyle = [styles.tableCell, styles.tableCellHeader];

export { IGymExerciseProps, IGymExerciseEntry, IGymExerciseItem };
export default GymExercise;

import { ICommandBarItem } from "components/command-bar";
import ProgressBar from "components/progress-bar";
import Trackable from "components/trackable";
import ProgressDisplayMode from "models/progress-display-mode";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { InjectedIntlProps, injectIntl } from "react-intl";
import {
    LayoutRectangle,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

type IAggregateProps = InjectedIntlProps & {
    index?: number;
    id: string;
    status: TrackableStatus;
    isBatchEditMode?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
    isReorderMode?: boolean;
    isDragged?: boolean;
    commands?: ICommandBarItem[];
    cardStyle?: StyleProp<ViewStyle>;
    cardHeaderStyle?: StyleProp<ViewStyle>;
    cardBodyStyle?: StyleProp<ViewStyle>;
    style?: StyleProp<ViewStyle>;
    isAfterAggregate?: boolean;
    isBeforeAggregate?: boolean;
    isLast?: boolean;
    isFirst?: boolean;
    progress: number;
    maxProgress?: number;
    onSelectChange?: (id: string, isSelected: boolean) => void;
    onLongPress?: (id: string, parentId?: string) => void;
    onPressOut?: (id: string) => void;
    onLayout?: (id: string, layout?: LayoutRectangle) => void;
};

class Aggregate extends React.Component<IAggregateProps> {
    private layoutContainer?: View;

    public render() {
        const {
            id,
            intl,
            children,
            progress,
            maxProgress,
            isDragged,
            isAfterAggregate,
            isBeforeAggregate,
            isFirst,
            isLast,
            ...restProps,
        } = this.props;
        let progressBar;
        let progressValue;

        if (maxProgress == null) {
            progressValue = progress;
        } else {
            progressBar = (
                <ProgressBar
                    maxValue={maxProgress}
                    value={progress}
                    mode={ProgressDisplayMode.Percentage}
                    style={styles.progressBar}
                />
            );
        }

        const style = [
            styles.container,
            isFirst && styles.containerFirst,
            isDragged && styles.containerDragged,
        ];
        const title = intl.formatMessage(
            { id: "aggregate.total" }, { progress: progressValue });
        return (
            <View style={style as any}>
                <View
                    style={styles.content}
                    ref={this.onLayoutContainerRef as any}
                >
                    <Trackable
                        id={id}
                        isNested={true}
                        isDragged={isDragged}
                        title={title}
                        cardHeaderStyle={styles.cardHeader}
                        cardHeaderTitleStyle={styles.cardHeaderTitle}
                        onGetLayoutRef={this.onGetLayoutRef}
                        {...restProps}
                    >
                        {progressBar}
                    </Trackable>
                    {children}
                </View>
            </View>
        );
    }

    private onLayoutContainerRef = (ref?: View) => this.layoutContainer = ref;

    private onGetLayoutRef = () => this.layoutContainer;
}

const styles = StyleSheet.create({
    cardHeader: {
        paddingBottom: 0,
    },
    cardHeaderTitle: {
        fontWeight: "bold",
    },
    container: {
        marginBottom: 8,
    },
    containerDragged: {
        opacity: 0,
    },
    containerFirst: {
        marginTop: 8,
    },
    content: {
        backgroundColor: "#fff",
    },
    progressBar: {
        marginTop: 0,
    },
});

export { IAggregateProps };
export default injectIntl(Aggregate);

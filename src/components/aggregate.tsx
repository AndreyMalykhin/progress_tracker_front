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
            intl,
            children,
            progress,
            maxProgress,
            isDragged,
            isAfterAggregate,
            isBeforeAggregate,
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
            isDragged ? styles.containerDragged : null,
            isAfterAggregate ? styles.containerAfterAggregate : null,
            isBeforeAggregate ? styles.containerBeforeAggregate : null,
            isLast ? styles.containerLast : null,
        ];
        const title = intl.formatMessage(
            { id: "aggregate.total" }, { progress: progressValue });
        return (
            <View style={style}>
                <View ref={this.onLayoutContainerRef as any}>
                    <Trackable
                        isDragged={isDragged}
                        title={title}
                        isNoCard={true}
                        style={styles.trackable}
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
    container: {
        marginBottom: 32,
        marginTop: 24,
    },
    containerAfterAggregate: {
        marginTop: 0,
    },
    containerBeforeAggregate: {
        marginBottom: 24,
    },
    containerDragged: {
        opacity: 0,
    },
    containerLast: {
        marginBottom: 0,
    },
    progressBar: {
        marginTop: 0,
    },
    trackable: {
        marginBottom: 0,
    },
});

export { IAggregateProps };
export default injectIntl(Aggregate);

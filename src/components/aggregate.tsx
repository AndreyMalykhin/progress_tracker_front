import { ICommandBarItem } from "components/command-bar";
import ProgressBar from "components/progress-bar";
import Trackable from "components/trackable";
import ITrackableBaseProps from "components/trackable-base-props";
import ProgressDisplayMode from "models/progress-display-mode";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { LayoutRectangle, StyleSheet, View } from "react-native";

type IAggregateProps = InjectedIntlProps & ITrackableBaseProps & {
    progress: number;
    maxProgress?: number;
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

        const title = intl.formatMessage(
            { id: "aggregate.total" }, { progress: progressValue });
        return (
            <View style={isDragged ? containerDraggedStyle : styles.container}>
                <View ref={this.onLayoutContainerRef as any}>
                    <Trackable
                        isDragged={isDragged}
                        title={title}
                        cardStyle={styles.card}
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
    card: {
        borderWidth: 0,
        padding: 0,
    },
    container: {
        marginVertical: 8,
    },
    containerDragged: {
        opacity: 0,
    },
    progressBar: {
        marginBottom: 8,
    },
    trackable: {
        marginVertical: 0,
    },
});

const containerDraggedStyle = [styles.container, styles.containerDragged];

export { IAggregateProps };
export default injectIntl(Aggregate);

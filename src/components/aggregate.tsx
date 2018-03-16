import AnimatableView from "components/animatable-view";
import { ICommandBarItem } from "components/command-bar";
import {
    CardStyle,
    Color,
    FontWeightStyle,
    Gap,
    TypographyStyle,
} from "components/common-styles";
import Counter from "components/counter";
import NumericalGoal from "components/numerical-goal";
import ProgressBar from "components/progress-bar";
import Trackable, {
    trackableMargin,
} from "components/trackable";
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
import * as Animatable from "react-native-animatable";

interface IAggregateProps {
    index?: number;
    id: string;
    title: string;
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
}

class Aggregate extends React.Component<IAggregateProps & InjectedIntlProps> {
    private layoutContainerRef?: View;
    private containerRef?: Animatable.View;

    public render() {
        const {
            children,
            isDragged,
            isFirst,
            ...restProps,
        } = this.props;
        const style = [
            styles.container,
            isFirst && styles.containerFirst,
        ];
        return (
            <AnimatableView
                style={style as any}
                onRef={this.onContainerRef as any}
            >
                <View
                    style={styles.content}
                    ref={this.onLayoutContainerRef as any}
                >
                    {this.renderTrackable()}
                    {children}
                </View>
            </AnimatableView>
        );
    }

    public componentWillReceiveProps(nextProps: IAggregateProps) {
        if (this.containerRef) {
            if (!this.props.isDragged && nextProps.isDragged) {
                this.containerRef.fadeOut!();
            } else if (this.props.isDragged && !nextProps.isDragged) {
                this.containerRef.fadeIn!();
            }
        }
    }

    private renderTrackable() {
        const {
            maxProgress,
            isFirst,
            isLast,
            title,
            ...restProps,
        } = this.props;

        if (maxProgress == null) {
            return (
                <Counter
                    title={title}
                    isNested={true}
                    cardHeaderStyle={styles.cardHeader}
                    cardHeaderTitleStyle={styles.cardHeaderTitle}
                    onGetLayoutRef={this.onGetLayoutRef}
                    {...restProps}
                />
            );
        }

        return (
            <NumericalGoal
                title={title}
                progressDisplayMode={ProgressDisplayMode.Percentage}
                maxProgress={maxProgress}
                isNested={true}
                cardHeaderStyle={styles.cardHeader}
                cardHeaderTitleStyle={styles.cardHeaderTitle}
                onGetLayoutRef={this.onGetLayoutRef}
                {...restProps}
            />
        );
    }

    private onLayoutContainerRef = (ref?: View) =>
        this.layoutContainerRef = ref

    private onGetLayoutRef = () => this.layoutContainerRef;

    private onContainerRef = (ref?: Animatable.View) => this.containerRef = ref;
}

const styles = StyleSheet.create({
    cardHeader: {},
    cardHeaderTitle: {
        ...TypographyStyle.title2,
    },
    container: {
        marginBottom: trackableMargin,
    },
    containerFirst: {
        marginTop: trackableMargin,
    },
    content: {
        backgroundColor: CardStyle.backgroundColor,
    },
});

export { IAggregateProps };
export default injectIntl(Aggregate);

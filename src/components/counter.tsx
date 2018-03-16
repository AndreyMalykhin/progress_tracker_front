import AnimatedNumber from "components/animated-number";
import { ICommandBarItem } from "components/command-bar";
import { Gap, TouchableStyle } from "components/common-styles";
import Text from "components/text";
import Trackable from "components/trackable";
import { BodyText, CalloutText } from "components/typography";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import {
    Animated,
    Easing,
    LayoutRectangle,
    StyleProp,
    StyleSheet,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";
import * as Animatable from "react-native-animatable";

interface ICounterProps {
    index?: number;
    id: string;
    parentId?: string;
    status: TrackableStatus;
    isBatchEditMode?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
    isReorderMode?: boolean;
    isDragged?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
    isNested?: boolean;
    commands?: ICommandBarItem[];
    statusDuration?: number;
    style?: StyleProp<ViewStyle>;
    cardHeaderStyle?: StyleProp<ViewStyle>;
    cardHeaderTitleStyle?: StyleProp<TextStyle>;
    iconName?: string;
    title: string;
    progress: number;
    onSelectChange?: (id: string, isSelected: boolean) => void;
    onLongPress?: (id: string, parentId?: string) => void;
    onPressOut?: (id: string) => void;
    onLayout?: (id: string, layout?: LayoutRectangle) => void;
    onGetLayoutRef?: () => View | undefined;
}

class Counter extends React.PureComponent<ICounterProps> {
    public render() {
        const { progress, ...restProps } = this.props;
        return (
            <Trackable {...restProps}>
                <AnimatedNumber
                    value={progress}
                    onRender={this.onRenderNumber}
                />
            </Trackable>
        );
    }

    private onRenderNumber = (value: string) => {
        return <CalloutText style={styles.progress}>{value}</CalloutText>;
    }
}

const styles = StyleSheet.create({
    progress: {
        paddingBottom: Gap.single,
        textAlign: "center",
    },
});

export { ICounterProps };
export default Counter;

import { ICommandBarItem } from "components/command-bar";
import { Gap, TouchableStyle } from "components/common-styles";
import Text from "components/text";
import Trackable from "components/trackable";
import { BodyText, CalloutText } from "components/typography";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import {
    LayoutRectangle,
    StyleProp,
    StyleSheet,
    ViewStyle,
} from "react-native";

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
    iconName: string;
    title: string;
    progress: number;
    onSelectChange?: (id: string, isSelected: boolean) => void;
    onLongPress?: (id: string, parentId?: string) => void;
    onPressOut?: (id: string) => void;
    onLayout?: (id: string, layout?: LayoutRectangle) => void;
}

class Counter extends React.PureComponent<ICounterProps> {
    public render() {
        const { progress, ...restProps } = this.props;
        return (
            <Trackable {...restProps}>
                <CalloutText style={styles.progress}>{progress}</CalloutText>
            </Trackable>
        );
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

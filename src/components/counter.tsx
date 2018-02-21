import { ICommandBarItem } from "components/command-bar";
import Text from "components/text";
import Trackable from "components/trackable";
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
    commands?: ICommandBarItem[];
    duration?: number;
    cardStyle?: StyleProp<ViewStyle>;
    cardHeaderStyle?: StyleProp<ViewStyle>;
    cardBodyStyle?: StyleProp<ViewStyle>;
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
                <Text style={styles.progress}>{progress}</Text>
            </Trackable>
        );
    }
}

const styles = StyleSheet.create({
    progress: {
        lineHeight: 32,
        textAlign: "center",
    },
});

export { ICounterProps };
export default Counter;

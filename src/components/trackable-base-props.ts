import { ICommandBarItem } from "components/command-bar";
import TrackableStatus from "models/trackable-status";
import {
    LayoutRectangle,
    PanResponderGestureState,
    StyleProp,
    ViewStyle,
} from "react-native";

interface ITrackableBaseProps {
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
    onSelectChange?: (id: string, isSelected: boolean) => void;
    onLongPress?: (id: string, parentId?: string) => void;
    onPressOut?: (id: string) => void;
    onLayout?: (id: string, layout?: LayoutRectangle) => void;
}

export default ITrackableBaseProps;

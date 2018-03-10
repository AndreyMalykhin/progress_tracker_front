import { ICommandBarItem } from "components/command-bar";
import ProgressDisplayMode from "models/progress-display-mode";
import ReviewStatus from "models/review-status";
import TrackableStatus from "models/trackable-status";
import { LayoutRectangle, StyleProp, ViewStyle } from "react-native";

interface IGoalProps {
    index?: number;
    id: string;
    parentId?: string;
    status: TrackableStatus;
    isProveable?: boolean;
    isProveDisabled?: boolean;
    isProving?: boolean;
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
    myReviewStatus?: ReviewStatus;
    maxProgress: number;
    progressDisplayMode: ProgressDisplayMode;
    onProve: (id: string) => void;
    onSelectChange?: (id: string, isSelected: boolean) => void;
    onLongPress?: (id: string, parentId?: string) => void;
    onPressOut?: (id: string) => void;
    onLayout?: (id: string, layout?: LayoutRectangle) => void;
}

export default IGoalProps;

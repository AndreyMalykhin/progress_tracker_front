import { ICommandBarItem } from "components/command-bar";
import ITrackableBaseProps from "components/trackable-base-props";
import ProgressDisplayMode from "models/progress-display-mode";
import TrackableStatus from "models/trackable-status";
import { LayoutRectangle } from "react-native";

interface IGoalProps extends ITrackableBaseProps {
    iconName: string;
    title: string;
    progress: number;
    maxProgress: number;
    progressDisplayMode: ProgressDisplayMode;
    onProve: (id: string) => void;
}

export default IGoalProps;

import ActionSheet, {
    IActionSheetOption,
    IActionSheetProps,
} from "components/action-sheet";
import * as React from "react";
import TrackableType from "utils/trackable-type";

interface INewTrackablePickerProps {
    isOpen: boolean;
    onSelect: (trackableType?: TrackableType) => void;
}

const options: IActionSheetOption[] = [
    {
        id: TrackableType.Counter,
        msgId: "trackableTypes.counter",
    },
    {
        id: TrackableType.GymExercise,
        msgId: "trackableTypes.gymExercise",
    },
    {
        id: TrackableType.NumericalGoal,
        msgId: "trackableTypes.numericalGoal",
    },
    {
        id: TrackableType.TaskGoal,
        msgId: "trackableTypes.taskGoal",
    },
];

class NewTrackablePicker extends React.Component<INewTrackablePickerProps> {
    public render() {
        return (
            <ActionSheet
                titleMsgId={"newTrackable.title"}
                options={options}
                isOpen={this.props.isOpen}
                onSelect={this.onSelect}
            />
        );
    }

    private onSelect = (id?: string|number) =>
        this.props.onSelect(id as TrackableType)
}

export { INewTrackablePickerProps };
export default NewTrackablePicker;

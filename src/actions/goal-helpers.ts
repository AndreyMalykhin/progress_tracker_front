import {
    IUpdateProgressAggregateFragment,
    updateProgress,
} from "actions/aggregate-helpers";
import TrackableStatus from "models/trackable-status";

interface ISetProgressFragment {
    id: string;
    progress: number;
    maxProgress: number;
    status: TrackableStatus;
    achievementDate?: number;
    statusChangeDate?: number;
    parent?: IUpdateProgressAggregateFragment;
}

type IAddProgressFragment = ISetProgressFragment;

function addProgress(goal: IAddProgressFragment, value: number) {
    setProgress(goal, goal.progress + value);
}

function setProgress(goal: ISetProgressFragment, value: number) {
    goal.progress = value;

    if (goal.progress >= goal.maxProgress) {
        goal.progress = goal.maxProgress;
        goal.status = TrackableStatus.PendingProof;
        goal.statusChangeDate = Date.now();
        goal.achievementDate = goal.statusChangeDate;
    }

    if (goal.parent) {
        updateProgress(goal.parent, goal);
    }
}

export { addProgress };

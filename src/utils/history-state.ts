import {
    IAggregateFormContainerHistoryState,
} from "components/aggregate-form-container";
import { IStackingSwitchHistoryState } from "components/stacking-switch";
import { IMultiStackHistoryState } from "utils/multi-stack-history";

type IHsitoryState = Partial<(
    IMultiStackHistoryState
    & IStackingSwitchHistoryState
    & IAggregateFormContainerHistoryState
)>;

export default IHsitoryState;

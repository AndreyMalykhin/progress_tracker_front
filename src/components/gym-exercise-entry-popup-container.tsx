import GymExerciseEntryPopup, {
    IGymExerciseEntryPopupResult,
} from "components/gym-exercise-entry-popup";
import { debounce } from "lodash";
import * as React from "react";
import formSaveDelay from "utils/form-save-delay";

interface IGymExerciseEntryPopupContainerProps {
    onClose: (result?: IGymExerciseEntryPopupResult) => void;
}

interface IGymExerciseEntryPopupContainerState {
    setCount?: string;
    setCountError?: string|null;
    repetitionCount?: string;
    repetitionCountError?: string|null;
    weight?: string;
    weightError?: string|null;
}

class GymExerciseEntryPopupContainer extends React.Component<
    IGymExerciseEntryPopupContainerProps, IGymExerciseEntryPopupContainerState
> {
    public state: IGymExerciseEntryPopupContainerState = {};

    public constructor(
        props: IGymExerciseEntryPopupContainerProps, context: any,
    ) {
        super(props, context);
        this.validateRepetitionCount =
            debounce(this.validateRepetitionCount, formSaveDelay);
        this.validateSetCount =
            debounce(this.validateSetCount, formSaveDelay);
        this.validateWeight = debounce(this.validateWeight, formSaveDelay);
    }

    public render() {
        const {
            repetitionCount,
            repetitionCountError,
            setCount,
            setCountError,
            weight,
            weightError,
        } = this.state;
        const isValid = repetitionCountError === null && setCountError === null
            && weightError === null;
        return (
            <GymExerciseEntryPopup
                isValid={isValid}
                repetitionCount={repetitionCount}
                repetitionCountError={repetitionCountError}
                setCount={setCount}
                setCountError={setCountError}
                weight={weight}
                weightError={weightError}
                onCancel={this.onCancel}
                onSubmit={this.onSubmit}
                onChangeRepetitionCount={this.onChangeRepetitionCount}
                onChangeSetCount={this.onChangeSetCount}
                onChangeWeight={this.onChangeWeight}
            />
        );
    }

    private onChangeRepetitionCount = (repetitionCount: string) => {
        this.setState({ repetitionCount });
        this.validateRepetitionCount();
    }

    private validateRepetitionCount = () => {
        this.setState((prevState) => {
            const repetitionCount = parseInt(prevState.repetitionCount!, 10);
            const repetitionCountError = isNaN(repetitionCount!) ||
                repetitionCount! <= 0 ? "errors.zeroOrNegativeOrNotInteger" : null;
            return { repetitionCountError };
        });
    }

    private onChangeSetCount = (setCount: string) => {
        this.setState({ setCount });
        this.validateSetCount();
    }

    private validateSetCount = () => {
        this.setState((prevState) => {
            const setCount = parseInt(prevState.setCount!, 10);
            const setCountError = isNaN(setCount!) || setCount! <= 0 ?
                "errors.zeroOrNegativeOrNotInteger" : null;
            return { setCountError };
        });
    }

    private onChangeWeight = (weight: string) => {
        this.setState({ weight });
        this.validateWeight();
    }

    private validateWeight = () => {
        this.setState((prevState) => {
            const weight = parseFloat(prevState.weight!);
            const weightError = isNaN(weight!) || weight! < 0 ?
                "errors.negativeOrNotNumber" : null;
            return { weightError };
        });
    }

    private onCancel = () => this.props.onClose();

    private onSubmit = () => {
        const { repetitionCount, setCount, weight } = this.state;
        this.props.onClose({
            date: Date.now(),
            repetitionCount: Number(repetitionCount!),
            setCount: Number(setCount!),
            weight: Number(weight!),
        });
    }
}

export { IGymExerciseEntryPopupContainerProps };
export default GymExerciseEntryPopupContainer;

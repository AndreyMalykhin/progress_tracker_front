import GymExerciseForm from "components/gym-exercise-form";
import Type from "models/type";
import * as React from "react";

interface IGymExercise {
    __typename: Type;
    id: string;
    title: string;
    iconName: string;
    isPublic: boolean;
}

interface IGymExerciseFormContainerProps {
    trackable?: IGymExercise;
    isUserLoggedIn: boolean;
}

class GymExerciseFormContainer extends
    React.Component<IGymExerciseFormContainerProps> {
    public render() {
        // TODO
        return null;
    }
}

export { IGymExercise };
export default GymExerciseFormContainer;

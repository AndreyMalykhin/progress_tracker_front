import CounterFormContainer, {
    ICounter,
} from "components/counter-form-container";
import GymExerciseFormContainer, {
    IGymExercise,
} from "components/gym-exercise-form-container";
import Header from "components/header";
import NumericalGoalFormContainer, {
    INumericalGoal,
} from "components/numerical-goal-form-container";
import TaskGoalFormContainer, {
    ITaskGoal,
} from "components/task-goal-form-container";
import TrackableType from "models/trackable-type";
import Type from "models/type";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    KeyboardAwareScrollView,
} from "react-native-keyboard-aware-scroll-view";

type ITrackable = (ITaskGoal | INumericalGoal | ICounter | IGymExercise) & {
    __typename: TrackableType;
};

interface ITrackableFormPageProps {
    trackable?: ITrackable;
    trackableType: TrackableType;
    isUserLoggedIn: boolean;
    isOnline?: boolean;
}

class TrackableFormPage extends React.Component<ITrackableFormPageProps> {
    public render() {
        return (
            <View style={styles.container}>
                <Header />
                {this.renderForm()}
            </View>
        );
    }

    private renderForm() {
        const { trackable, trackableType, isUserLoggedIn, isOnline } =
            this.props;
        switch (trackableType) {
            case TrackableType.TaskGoal:
            return (
                <TaskGoalFormContainer
                    isUserLoggedIn={isUserLoggedIn}
                    isOnline={isOnline}
                    trackable={trackable as ITaskGoal}
                />
            );
            case TrackableType.NumericalGoal:
            return (
                <NumericalGoalFormContainer
                    isUserLoggedIn={isUserLoggedIn}
                    isOnline={isOnline}
                    trackable={trackable as INumericalGoal}
                />
            );
            case TrackableType.Counter:
            return (
                <CounterFormContainer
                    isUserLoggedIn={isUserLoggedIn}
                    isOnline={isOnline}
                    trackable={trackable as ICounter}
                />
            );
            case TrackableType.GymExercise:
            return (
                <GymExerciseFormContainer
                    isUserLoggedIn={isUserLoggedIn}
                    isOnline={isOnline}
                    trackable={trackable as IGymExercise}
                />
            );
        }

        throw new Error("Unexpected type: " + trackableType);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export { ITrackableFormPageProps, ITrackable };
export default TrackableFormPage;

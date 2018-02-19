import Type from "models/type";

enum TrackableType {
    Counter = Type.Counter,
    NumericalGoal = Type.NumericalGoal,
    TaskGoal = Type.TaskGoal,
    GymExercise = Type.GymExercise,
    Aggregate = Type.Aggregate,
}

export default TrackableType;

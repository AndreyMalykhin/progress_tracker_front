import Type from "models/type";

interface IObject {
    __typename?: Type;
    id?: string;
}

function dataIdFromObject(object: IObject) {
    const { __typename, id } = object;

    switch (__typename) {
        case Type.Counter:
        case Type.GymExercise:
        case Type.Aggregate:
        case Type.NumericalGoal:
        case Type.TaskGoal:
        return "Trackable:" + id;
    }

    return id ? `${__typename}:${id}` : null;
}

export default dataIdFromObject;

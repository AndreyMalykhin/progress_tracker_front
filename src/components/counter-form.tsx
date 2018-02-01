import Type from "models/type";
import * as React from "react";

interface ICounterFormProps {
    title: string;
    titleError?: string|null;
    iconName: string;
    isPublic: boolean;
    isNew: boolean;
    onChangeTitle: (value: string) => void;
    onChangePublic: (value: boolean) => void;
    onChangeIcon: (name: string) => void;
}

class CounterForm extends React.Component<ICounterFormProps> {
    public render() {
        // TODO
        return null;
    }
}

export default CounterForm;

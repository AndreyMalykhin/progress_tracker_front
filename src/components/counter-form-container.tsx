import CounterForm from "components/counter-form";
import Type from "models/type";
import * as React from "react";

interface ICounter {
    __typename: Type;
    id: string;
    title: string;
    iconName: string;
    isPublic: boolean;
}

interface ICounterFormContainerProps {
    trackable?: ICounter;
    isUserLoggedIn: boolean;
}

class CounterFormContainer extends React.Component<ICounterFormContainerProps> {
    public render() {
        // TODO
        return null;
    }
}

export { ICounter };
export default CounterFormContainer;

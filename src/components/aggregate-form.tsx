import TrackableForm from "components/trackable-form";
import Type from "models/type";
import * as React from "react";

interface IAggregateFormProps {
    title?: string;
    titleError?: string|null;
    onChangeTitle: (value: string) => void;
}

class AggregateForm extends React.Component<IAggregateFormProps> {
    public render() {
        return (
            <TrackableForm
                titleLabelMsgId="aggregateForm.titleLabel"
                titlePlaceholderMsgId="aggregateForm.titlePlaceholder"
                {...this.props}
            />
        );
    }
}

export default AggregateForm;

import TrackableForm from "components/trackable-form";
import Type from "models/type";
import * as React from "react";

interface ICounterFormProps {
    title?: string;
    titleError?: string|null;
    iconName: string;
    availableIconNames: string[];
    isPublic: boolean;
    isPublicDisabled: boolean;
    isIconPickerOpen?: boolean;
    isShareable?: boolean;
    isShareDisabled?: boolean;
    share?: boolean;
    onChangeShare: (share: boolean) => void;
    onOpenIconPicker: () => void;
    onChangeTitle: (value: string) => void;
    onChangePublic: (value: boolean) => void;
    onChangeIcon: (name: string) => void;
}

class CounterForm extends React.Component<ICounterFormProps> {
    public render() {
        return (
            <TrackableForm
                titleLabelMsgId="counterForm.titleLabel"
                titlePlaceholderMsgId="counterForm.titlePlaceholder"
                {...this.props}
            />
        );
    }
}

export default CounterForm;

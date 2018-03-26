import PrimitiveTrackableForm from "components/primitive-trackable-form";
import Type from "models/type";
import * as React from "react";
import * as Animatable from "react-native-animatable";
import {
    KeyboardAwareScrollView,
} from "react-native-keyboard-aware-scroll-view";

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
    onIconPickerRef: (ref?: Animatable.View) => void;
    onRef?: (ref?: KeyboardAwareScrollView) => void;
}

class CounterForm extends React.Component<ICounterFormProps> {
    public render() {
        return (
            <PrimitiveTrackableForm
                titleLabelMsgId="counterForm.titleLabel"
                titlePlaceholderMsgId="counterForm.titlePlaceholder"
                {...this.props}
            />
        );
    }
}

export default CounterForm;

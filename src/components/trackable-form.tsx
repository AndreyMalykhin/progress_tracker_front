import Button, { ButtonIcon, ButtonTitle } from "components/button";
import {
    FormBody,
    FormError,
    FormGroup,
    FormLabel,
    FormSection,
} from "components/form";
import {
    FormIconPickerCollapsed,
    FormIconPickerExpanded,
} from "components/form-icon-picker";
import FormSwitch from "components/form-switch";
import FormTextInput from "components/form-text-input";
import * as React from "react";
import {
    StyleSheet,
    Text,
    TextInput as NativeTextInput,
    View,
} from "react-native";

interface ITrackableFormProps {
    title: string;
    titleError?: string|null;
    iconName: string;
    availableIconNames: string[];
    isPublic: boolean;
    isPublicDisabled: boolean;
    isIconPickerOpen?: boolean;
    titleLabelMsgId: string;
    titlePlaceholderMsgId: string;
    onOpenIconPicker: () => void;
    onChangeTitle: (value: string) => void;
    onChangePublic: (value: boolean) => void;
    onChangeIcon: (name: string) => void;
    onRenderChildren?: () => JSX.Element;
}

class TrackableForm extends React.Component<ITrackableFormProps> {
    public render() {
        const {
            isIconPickerOpen,
            title,
            titleError,
            iconName,
            isPublic,
            isPublicDisabled,
            availableIconNames,
            titleLabelMsgId,
            titlePlaceholderMsgId,
            onRenderChildren,
            onChangeTitle,
            onChangeIcon,
            onOpenIconPicker,
            onChangePublic,
        } = this.props;

        if (isIconPickerOpen) {
            return (
                <FormIconPickerExpanded
                    availableIconNames={availableIconNames}
                    iconName={iconName}
                    onSelect={onChangeIcon}
                />
            );
        }

        return (
            <FormBody>
                <FormTextInput
                    labelMsgId={titleLabelMsgId}
                    placeholderMsgId={titlePlaceholderMsgId}
                    value={title}
                    errorMsgId={titleError}
                    onChangeText={onChangeTitle}
                />
                <FormIconPickerCollapsed
                    iconName={iconName}
                    onExpand={onOpenIconPicker}
                />
                <FormSwitch
                    labelMsgId="trackableForm.isPublicLabel"
                    hintMsgId="trackableForm.isPublicHint"
                    disabled={isPublicDisabled}
                    value={isPublic}
                    onValueChange={onChangePublic}
                />
                {onRenderChildren && onRenderChildren()}
            </FormBody>
        );
    }
}

const styles = StyleSheet.create({});

export { ITrackableFormProps };
export default TrackableForm;

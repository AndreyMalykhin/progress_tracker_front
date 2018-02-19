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
import {
    KeyboardAwareScrollView,
} from "react-native-keyboard-aware-scroll-view";

interface ITrackableFormProps {
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
    titleLabelMsgId: string;
    titlePlaceholderMsgId: string;
    onOpenIconPicker: () => void;
    onChangeTitle: (value: string) => void;
    onChangePublic: (value: boolean) => void;
    onChangeIcon: (name: string) => void;
    onChangeShare: (share: boolean) => void;
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
            isShareable,
            isShareDisabled,
            share,
            availableIconNames,
            titleLabelMsgId,
            titlePlaceholderMsgId,
            onRenderChildren,
            onChangeTitle,
            onChangeIcon,
            onOpenIconPicker,
            onChangePublic,
            onChangeShare,
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

        const shareSwitch = isShareable && (
            <FormSwitch
                labelMsgId="trackableForm.shareLabel"
                disabled={isShareDisabled}
                value={share}
                onValueChange={onChangeShare}
            />
        );
        return (
            <KeyboardAwareScrollView>
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
                    {shareSwitch}
                    {onRenderChildren && onRenderChildren()}
                </FormBody>
            </KeyboardAwareScrollView>
        );
    }
}

const styles = StyleSheet.create({});

export { ITrackableFormProps };
export default TrackableForm;

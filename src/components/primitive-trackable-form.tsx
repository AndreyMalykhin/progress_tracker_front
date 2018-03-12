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
import TrackableForm, { ITrackableFormProps } from "components/trackable-form";
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

interface IPrimitiveTrackableFormProps extends ITrackableFormProps {
    iconName: string;
    availableIconNames: string[];
    isPublic: boolean;
    isPublicDisabled: boolean;
    isIconPickerOpen?: boolean;
    isShareable?: boolean;
    isShareDisabled?: boolean;
    share?: boolean;
    onOpenIconPicker: () => void;
    onChangePublic: (value: boolean) => void;
    onChangeIcon: (name: string) => void;
    onChangeShare: (share: boolean) => void;
}

class PrimitiveTrackableForm extends
    React.Component<IPrimitiveTrackableFormProps> {
    public render() {
        const { onRenderChildren, ...restProps } = this.props;
        return (
            <TrackableForm
                onRenderChildren={this.onRenderChildren}
                {...restProps}
            />
        );
    }

    private onRenderChildren = () => {
        const {
            isIconPickerOpen,
            iconName,
            isPublic,
            isPublicDisabled,
            isShareable,
            isShareDisabled,
            share,
            availableIconNames,
            onRenderChildren,
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
            <View>
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
            </View>
        );
    }
}

export { IPrimitiveTrackableFormProps };
export default PrimitiveTrackableForm;

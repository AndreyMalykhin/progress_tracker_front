import AnimatableView from "components/animatable-view";
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
import { stackingSwitchAnimationDuration } from "components/stacking-switch";
import TrackableForm, { ITrackableFormProps } from "components/trackable-form";
import * as React from "react";
import {
    StyleSheet,
    Text,
    TextInput as NativeTextInput,
    View,
} from "react-native";
import * as Animatable from "react-native-animatable";
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
    onIconPickerRef: (ref?: Animatable.View) => void;
}

class PrimitiveTrackableForm extends
    React.Component<IPrimitiveTrackableFormProps> {
    private iconPickerRef?: Animatable.View;

    public render() {
        const {
            iconName,
            availableIconNames,
            isIconPickerOpen,
            onRenderChildren,
            onChangeIcon,
            onIconPickerRef,
            ...restProps,
        } = this.props;

        if (isIconPickerOpen) {
            return (
                <AnimatableView
                    style={styles.iconPickerExpanded}
                    onRef={onIconPickerRef as any}
                    duration={stackingSwitchAnimationDuration}
                >
                    <FormIconPickerExpanded
                        availableIconNames={availableIconNames}
                        iconName={iconName}
                        onSelect={onChangeIcon}
                    />
                </AnimatableView>
            );
        }

        return (
            <TrackableForm
                onRenderChildren={this.onRenderChildren}
                {...restProps}
            />
        );
    }

    private onRenderChildren = () => {
        const {
            iconName,
            isPublic,
            isPublicDisabled,
            isShareable,
            isShareDisabled,
            share,
            onRenderChildren,
            onOpenIconPicker,
            onChangePublic,
            onChangeShare,
        } = this.props;
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

const styles = StyleSheet.create({
    iconPickerExpanded: {
        flex: 1,
    },
});

export { IPrimitiveTrackableFormProps };
export default PrimitiveTrackableForm;

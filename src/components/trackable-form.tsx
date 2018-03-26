import { FormBody } from "components/form";
import FormTextInput from "components/form-text-input";
import * as React from "react";
import {
    KeyboardAwareScrollView, KeyboardAwareScrollViewProps,
} from "react-native-keyboard-aware-scroll-view";

interface ITrackableFormProps {
    title?: string;
    titleError?: string|null;
    titleLabelMsgId: string;
    titlePlaceholderMsgId: string;
    onChangeTitle: (value: string) => void;
    onRenderChildren?: () => JSX.Element;
    onRef?: (ref?: KeyboardAwareScrollView) => void;
}

interface IKeyboardAwareScrollViewImplProps extends
    KeyboardAwareScrollViewProps {
    innerRef?: (ref?: KeyboardAwareScrollView) => void;
}

const KeyboardAwareScrollViewImpl = KeyboardAwareScrollView as
    React.ComponentType<IKeyboardAwareScrollViewImplProps>;

class TrackableForm extends React.Component<ITrackableFormProps> {
    public render() {
        const {
            title,
            titleError,
            titleLabelMsgId,
            titlePlaceholderMsgId,
            onRenderChildren,
            onChangeTitle,
            onRef,
        } = this.props;
        return (
            <KeyboardAwareScrollViewImpl innerRef={onRef}>
                <FormBody>
                    <FormTextInput
                        labelMsgId={titleLabelMsgId}
                        placeholderMsgId={titlePlaceholderMsgId}
                        value={title}
                        errorMsgId={titleError}
                        onChangeText={onChangeTitle}
                    />
                    {onRenderChildren && onRenderChildren()}
                </FormBody>
            </KeyboardAwareScrollViewImpl>
        );
    }
}

export { ITrackableFormProps };
export default TrackableForm;

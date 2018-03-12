import { FormBody } from "components/form";
import FormTextInput from "components/form-text-input";
import * as React from "react";
import {
    KeyboardAwareScrollView,
} from "react-native-keyboard-aware-scroll-view";

interface ITrackableFormProps {
    title?: string;
    titleError?: string|null;
    titleLabelMsgId: string;
    titlePlaceholderMsgId: string;
    onChangeTitle: (value: string) => void;
    onRenderChildren?: () => JSX.Element;
}

class TrackableForm extends React.Component<ITrackableFormProps> {
    public render() {
        const {
            title,
            titleError,
            titleLabelMsgId,
            titlePlaceholderMsgId,
            onRenderChildren,
            onChangeTitle,
        } = this.props;

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
                    {onRenderChildren && onRenderChildren()}
                </FormBody>
            </KeyboardAwareScrollView>
        );
    }
}

export { ITrackableFormProps };
export default TrackableForm;

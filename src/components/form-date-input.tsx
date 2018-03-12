import FormTextInput from "components/form-text-input";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import * as React from "react";
import { compose } from "react-apollo";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { TouchableWithoutFeedback, View } from "react-native";
import DateTimePicker from "react-native-modal-datetime-picker";
import Sound from "utils/sound";

interface IFormDateInputProps {
    labelMsgId?: string;
    placeholderMsgId?: string;
    value?: Date;
    minValue?: Date;
    onValueChange: (value?: Date) => void;
}

interface IFormDateInputState {
    isPickerOpen?: boolean;
}

class FormDateInput extends React.Component<
    IFormDateInputProps & InjectedIntlProps & IWithDIContainerProps,
    IFormDateInputState
> {
    public state: IFormDateInputState = {};

    public render() {
        const { intl, labelMsgId, placeholderMsgId, value } = this.props;
        return (
            <View>
                <FormTextInput
                    value={value && intl.formatDate(value)}
                    labelMsgId={labelMsgId}
                    placeholderMsgId={placeholderMsgId}
                    editable={false}
                    clearable={value != null}
                    onTouchStart={this.onOpen}
                    onClear={this.onClear}
                />
                {this.state.isPickerOpen && this.renderPicker()}
            </View>
        );
    }

    private renderPicker() {
        const { intl, value, minValue } = this.props;
        const cancelLabel = intl.formatMessage({ id: "common.cancel" });
        const confirmLabel = intl.formatMessage({ id: "common.ok" });
        const title = intl.formatMessage({ id: "datePicker.title" });
        return (
            <DateTimePicker
                isVisible={true}
                date={value}
                minimumDate={minValue}
                cancelTextIOS={cancelLabel}
                confirmTextIOS={confirmLabel}
                titleIOS={title}
                onCancel={this.onCancel}
                onConfirm={this.onConfirm}
            />
        );
    }

    private onOpen = () => {
        this.setState({ isPickerOpen: true });
    }

    private onCancel = () => {
        this.setState({ isPickerOpen: false });
    }

    private onConfirm = (value?: Date) => {
        this.props.diContainer.audioManager.play(Sound.Click);
        this.onCancel();
        this.props.onValueChange(value);
    }

    private onClear = () => {
        this.onConfirm(undefined);
    }
}

export default compose(withDIContainer, injectIntl)(FormDateInput);

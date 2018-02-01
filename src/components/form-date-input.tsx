import FormTextInput from "components/form-text-input";
import * as React from "react";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { TouchableWithoutFeedback, View } from "react-native";
import DateTimePicker from "react-native-modal-datetime-picker";

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

class FormDateInput extends
    React.Component<IFormDateInputProps & InjectedIntlProps, IFormDateInputState> {
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
        return (
            <DateTimePicker
                isVisible={true}
                date={this.props.value}
                minimumDate={this.props.minValue}
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
        this.props.onValueChange(value);
        this.onCancel();
    }

    private onClear = () => {
        this.onConfirm(undefined);
    }
}

export default injectIntl(FormDateInput);

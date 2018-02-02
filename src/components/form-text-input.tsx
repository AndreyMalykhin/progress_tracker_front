import { FormError, FormGroup, FormLabel } from "components/form";
import TextInput, { ITextInputProps } from "components/text-input";
import * as React from "react";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { StyleSheet } from "react-native";

interface IFormTextInputProps extends ITextInputProps {
    labelMsgId?: string;
    errorMsgId?: string|null;
    placeholderMsgId?: string;
}

class FormTextInput extends
    React.PureComponent<IFormTextInputProps & InjectedIntlProps> {
    public render() {
        const {
            intl,
            labelMsgId,
            errorMsgId,
            placeholderMsgId,
            placeholder,
            disabled,
            ...restProps,
        } = this.props;
        const newPlaceholder = placeholderMsgId ?
            intl.formatMessage({ id: placeholderMsgId }) : placeholder;
        return (
            <FormGroup
                disabled={disabled}
                labelMsgId={labelMsgId}
                errorMsgId={errorMsgId}
            >
                <TextInput
                    disabled={disabled}
                    placeholder={newPlaceholder}
                    invalid={errorMsgId != null}
                    {...restProps}
                />
            </FormGroup>
        );
    }
}

const styles = StyleSheet.create({});

export default injectIntl(FormTextInput);

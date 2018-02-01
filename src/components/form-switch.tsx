import { FormGroup, FormHint, FormLabel } from "components/form";
import * as React from "react";
import { StyleSheet, Switch, SwitchProperties } from "react-native";

interface IFormSwitchProps extends SwitchProperties {
    labelMsgId?: string;
    hintMsgId?: string;
}

class FormSwitch extends React.PureComponent<IFormSwitchProps> {
    public render() {
        const { labelMsgId, hintMsgId, disabled, ...restProps } = this.props;
        return (
            <FormGroup
                horizontal={true}
                disabled={disabled}
                labelMsgId={labelMsgId}
                hintMsgId={hintMsgId}
                style={styles.container}
            >
                <Switch disabled={disabled} {...restProps} />
            </FormGroup>
        );
    }
}

const styles = StyleSheet.create({
    container: {},
});

export default FormSwitch;

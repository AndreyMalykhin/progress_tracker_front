import { FormGroup, FormHint, FormLabel } from "components/form";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import * as React from "react";
import { StyleSheet, Switch, SwitchProperties } from "react-native";
import Sound from "utils/sound";

interface IFormSwitchProps extends SwitchProperties {
    labelMsgId?: string;
    hintMsgId?: string;
}

class FormSwitch extends
    React.PureComponent<IFormSwitchProps & IWithDIContainerProps> {
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
                <Switch
                    {...restProps}
                    disabled={disabled}
                    onValueChange={this.onValueChange}
                />
            </FormGroup>
        );
    }

    private onValueChange = (value: boolean) => {
        const { onValueChange, diContainer } = this.props;
        diContainer.audioManager.play(Sound.Click);

        if (onValueChange) {
            onValueChange(value);
        }
    }
}

const styles = StyleSheet.create({
    container: {},
});

export default withDIContainer(FormSwitch);

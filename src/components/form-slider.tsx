import { Color, Gap, StateColor } from "components/common-styles";
import { FormGroup, FormLabel } from "components/form";
import * as React from "react";
import { Slider, SliderProperties, StyleSheet, View } from "react-native";

interface IFormSliderProps extends SliderProperties {
    labelMsgId?: string;
    onRenderValueFeedback?: (value?: number) => JSX.Element;
}

class FormSlider extends React.PureComponent<IFormSliderProps> {
    public render() {
        const {
            disabled,
            labelMsgId,
            value,
            style,
            onRenderValueFeedback,
            ...restProps,
        } = this.props;
        return (
            <FormGroup disabled={disabled} labelMsgId={labelMsgId}>
                <View style={styles.controlContainer}>
                    <Slider
                        minimumTrackTintColor={StateColor.active}
                        value={value}
                        disabled={disabled}
                        style={[styles.control, style]}
                        {...restProps}
                    />
                    {onRenderValueFeedback && onRenderValueFeedback()}
                </View>
            </FormGroup>
        );
    }
}

const styles = StyleSheet.create({
    control: {
        flex: 1,
    },
    controlContainer: {
        alignItems: "center",
        flexDirection: "row",
        paddingTop: Gap.double,
    },
});

export default FormSlider;

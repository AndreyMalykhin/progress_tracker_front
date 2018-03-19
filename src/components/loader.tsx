import { gap, touchableStyle } from "components/common-styles";
import * as React from "react";
import {
    ActivityIndicator,
    ActivityIndicatorProperties,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

interface ILoaderProps extends ActivityIndicatorProperties {
    isNoFillParent?: boolean;
}

class Loader extends React.Component<ILoaderProps> {
    public render() {
        const { style, isNoFillParent, ...restProps } = this.props;
        const newStyle = [
            styles.indicator,
            style,
            isNoFillParent && styles.indicatorNoFillParent,
        ];
        return (
            <ActivityIndicator
                style={newStyle as any}
                size="large"
                {...restProps}
            />
        );
    }
}

const styles = StyleSheet.create({
    indicator: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    indicatorNoFillParent: {
        flex: 0,
    },
});

export { ILoaderProps };
export default Loader;

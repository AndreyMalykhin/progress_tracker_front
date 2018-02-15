import * as React from "react";
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

interface ILoaderProps {
    isNoFillParent?: boolean;
    style?: StyleProp<ViewStyle>;
}

class Loader extends React.Component<ILoaderProps> {
    public render() {
        const { style, isNoFillParent } = this.props;
        const newStyle = [
            styles.indicator,
            style,
            isNoFillParent && styles.indicatorNoFillParent,
        ];
        return <ActivityIndicator style={newStyle as any} />;
    }
}

const styles = StyleSheet.create({
    indicator: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        minHeight: 32,
    },
    indicatorNoFillParent: {
        flex: 0,
    },
});

export default Loader;

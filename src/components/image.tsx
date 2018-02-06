import Loader from "components/loader";
import * as React from "react";
import { StyleSheet } from "react-native";
import ImageImpl, { IImageProps } from "react-native-image-progress";

class Image extends React.Component<IImageProps> {
    public render() {
        const { style, ...restProps } = this.props;
        return <ImageImpl style={[styles.container, style]} indicator={Loader} {...restProps} />;
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#eee",
        overflow: "hidden",
    },
});

export default Image;

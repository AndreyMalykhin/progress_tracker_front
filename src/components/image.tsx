import { color, stateColor } from "components/common-styles";
import Loader, { ILoaderProps } from "components/loader";
import * as React from "react";
import { StyleSheet } from "react-native";
import ImageImpl, { IImageProps } from "react-native-image-progress";

const indicatorProps: ILoaderProps = { size: "small", color: color.white };

class Image extends React.Component<IImageProps> {
    public render() {
        const { style, ...restProps } = this.props;
        return (
            <ImageImpl
                style={[styles.container, style]}
                indicator={Loader}
                indicatorProps={indicatorProps}
                {...restProps}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: stateColor.temporary,
        overflow: "hidden",
    },
});

export default Image;

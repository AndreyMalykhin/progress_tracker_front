import Image from "components/image";
import * as React from "react";
import { ImageStyle, StyleProp, StyleSheet } from "react-native";

const sizeSmall = 32;
const sizeLarge = 256;

interface IAvatarProps {
    uri: string;
    size: "small" | "large";
    style?: StyleProp<ImageStyle>;
}

class Avatar extends React.PureComponent<IAvatarProps> {
    public render() {
        const { uri, size, style } = this.props;
        const newStyle =
            [size === "small" ? styles.imgSmall : styles.imgLarge, style];
        return (
            <Image
                resizeMode="cover"
                style={newStyle as any}
                source={{ uri }}
            />
        );
    }
}

const styles = StyleSheet.create({
    imgLarge: {
        borderRadius: sizeLarge / 2,
        borderWidth: 1,
        height: sizeLarge,
        width: sizeLarge,
    },
    imgSmall: {
        borderRadius: sizeSmall / 2,
        borderWidth: 1,
        height: sizeSmall,
        width: sizeSmall,
    },
});

export default Avatar;

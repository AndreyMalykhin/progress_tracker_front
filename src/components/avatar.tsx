import Image from "components/image";
import * as React from "react";
import { ImageStyle, StyleProp, StyleSheet } from "react-native";

interface IAvatarProps {
    uri: string;
    size: "small" | "medium" |"large";
    style?: StyleProp<ImageStyle>;
}

const sizeSmall = 32;
const sizeMedium = 48;
const sizeLarge = 256;

class Avatar extends React.PureComponent<IAvatarProps> {
    public render() {
        const { uri, size, style } = this.props;
        const newStyle = [sizeToStyleMap[size], style];
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
    imgMedium: {
        borderRadius: sizeMedium / 2,
        borderWidth: 1,
        height: sizeMedium,
        width: sizeMedium,
    },
    imgSmall: {
        borderRadius: sizeSmall / 2,
        borderWidth: 1,
        height: sizeSmall,
        width: sizeSmall,
    },
});

const sizeToStyleMap = {
    large: styles.imgLarge,
    medium: styles.imgMedium,
    small: styles.imgSmall,
};

export default Avatar;

import { AvatarStyle, rem } from "components/common-styles";
import Image from "components/image";
import * as React from "react";
import { ImageStyle, StyleProp, StyleSheet } from "react-native";

interface IAvatarProps {
    uri: string;
    size: "small" | "medium" |"large";
    style?: StyleProp<ImageStyle>;
}

class Avatar extends React.PureComponent<IAvatarProps> {
    public render() {
        const { uri, size, style } = this.props;
        const newStyle = [styles.img, sizeToStyleMap[size], style];
        return (
            <Image
                resizeMode="cover"
                style={newStyle as any}
                source={uri ? { uri } : sizeToDefaultImgMap[size]}
            />
        );
    }
}

const styles = StyleSheet.create({
    img: {},
    imgLarge: {
        ...AvatarStyle.large,
    },
    imgMedium: {
        ...AvatarStyle.medium,
    },
    imgSmall: {
        ...AvatarStyle.small,
    },
});

const sizeToStyleMap = {
    large: styles.imgLarge,
    medium: styles.imgMedium,
    small: styles.imgSmall,
};

const sizeToDefaultImgMap = {
    large: require("images/default-avatar-medium.png"),
    medium: require("images/default-avatar-small.png"),
    small: require("images/default-avatar-small.png"),
};

export default Avatar;

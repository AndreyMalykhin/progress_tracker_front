import { headerStyle } from "components/common-styles";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import isIphoneX from "utils/is-iphone-x";

interface IBottomStatusBarProps {
    isTransparent?: boolean;
}

class BottomStatusBar extends React.Component<IBottomStatusBarProps> {
    public render() {
        if (isIphoneX()) {
            const style: any = [
                styles.containerIphoneX,
                this.props.isTransparent && styles.containerTransparent,
            ];
            return <View style={style} />;
        }

        return null;
    }
}

const styles = StyleSheet.create({
    containerIphoneX: {
        backgroundColor: headerStyle.backgroundColor,
        height: 34,
    },
    containerTransparent: {
        backgroundColor: "transparent",
    },
});

export default BottomStatusBar;

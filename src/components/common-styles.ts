import { human, systemWeights } from "react-native-typography";

const color = {
    black: "#212121",
    blue: "#2196f3",
    blueGray: "#78909c", // 400
    blueGrayDark: "#546e7a", // 600
    blueGrayLight: "#eceff1", // 50
    blueGrayLight2: "#cfd8dc", // 100
    blueGrayLight3: "#b0bec5", // 200
    brown: "#795548",
    brownDark: "#4e342e",
    brownLight: "#d7ccc8",
    cyan: "#00bcd4",
    cyanDark: "#006064",
    gray: "#bdbdbd", // 400
    grayDark: "#757575", // 600
    grayDark2: "#424242", // 800
    grayLight: "#fafafa", // 50
    grayLight2: "#f5f5f5", // 100
    grayLight3: "#eeeeee", // 200
    green: "#66bb6a", // 400
    greenDark: "#2e7d32", // 800
    orange: "#ff9800",
    orangeDeep: "#ff5722",
    pink: "#e91e63",
    purple: "#9c27b0",
    purpleDark: "#6a1b9a",
    red: "#ef5350", // 400
    teal: "#009688",
    tealDark: "#004d40",
    white: "#ffffff",
    yellow: "#ffeb3b",
};

const shadeColor = {
    dark: color.grayDark,
    dark2: color.grayDark2,
    light: color.grayLight,
    light2: color.grayLight2,
    light3: color.grayLight3,
    normal: color.gray,
};

const brandColor = {
    primary: color.red,
};

const severityColor = {
    danger: color.red,
    danger2: color.black,
    info: color.blue,
    success: color.green,
};

const stateColor = {
    active: brandColor.primary,
    disabled: color.gray,
    temporary: shadeColor.normal,
};

const baseBorderRadius = rem(0.8);
const borderRadius = {
    double: baseBorderRadius * 2,
    single: baseBorderRadius,
};

const baseGap = rem(0.8);
const gap = {
    double: baseGap * 2,
    half: baseGap / 2,
    quadruple: baseGap * 4,
    single: baseGap,
    triple: baseGap * 3,
};

const fontWeightStyle = {
    bold: systemWeights.bold,
    regular: systemWeights.regular,
};

const typographyStyle = {
    body: { ...human.bodyObject, color: color.black },
    bodyLight: human.bodyWhiteObject,
    callout: { ...human.calloutObject, color: color.black },
    calloutLight: human.calloutWhiteObject,
    caption1: { ...human.caption1Object, color: color.black },
    caption1Light: human.caption1WhiteObject,
    caption2: { ...human.caption2Object, color: color.black },
    caption2Light: human.caption2WhiteObject,
    footnote: { ...human.footnoteObject, color: color.black },
    footnoteLight: human.footnoteWhiteObject,
    headline: { ...human.headlineObject, color: color.black },
    headlineLight: human.headlineWhiteObject,
    largeTitle: { ...human.largeTitleObject, color: color.black },
    largeTitleLight: human.largeTitleWhiteObject,
    subhead: { ...human.subheadObject, color: color.black },
    subheadLight: human.subheadWhiteObject,
    title1: { ...human.title1Object, color: color.black },
    title1Light: human.title1WhiteObject,
    title2: { ...human.title2Object, color: color.black },
    title2Light: human.title2WhiteObject,
    title3: { ...human.title3Object, color: color.black },
    title3Light: human.title3WhiteObject,
};

const listStyle = {
    backgroundColor: shadeColor.light,
};

const cardStyle = {
    backgroundColor: color.white,
};

const userListContentStyle = {
    paddingLeft: gap.single,
    paddingRight: gap.single,
    paddingTop: gap.single,
};

const userListItemStyle = {
    paddingBottom: gap.quadruple,
};

const touchableStyle = {
    color: stateColor.active,
    minHeight: rem(4.8),
    minWidth: rem(4.8),
};

const iconStyle = {
    color: shadeColor.dark2,
};

const smallAvatarSize = 32;
const mediumAvatarSize = 48;
const largeAvatarSize = 256;
const avatarStyle = {
    large: {
        borderRadius: largeAvatarSize / 2,
        height: largeAvatarSize,
        width: largeAvatarSize,
    },
    medium: {
        borderRadius: mediumAvatarSize / 2,
        height: mediumAvatarSize,
        width: mediumAvatarSize,
    },
    small: {
        borderRadius: smallAvatarSize / 2,
        height: smallAvatarSize,
        width: smallAvatarSize,
    },
};

const progressBarStyle = {
    color: stateColor.active,
};

const headerStyle = {
    backgroundColor: shadeColor.light2,
    borderColor: shadeColor.normal,
};

function rem(value: number) {
    return value * 10;
}

export {
    rem,
    fontWeightStyle,
    borderRadius,
    typographyStyle,
    shadeColor,
    brandColor,
    color,
    severityColor,
    stateColor,
    gap,
    touchableStyle,
    iconStyle,
    avatarStyle,
    cardStyle,
    listStyle,
    userListContentStyle,
    userListItemStyle,
    progressBarStyle,
    headerStyle,
};

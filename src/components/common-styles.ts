import { human, systemWeights } from "react-native-typography";

const Color = {
    black: "#212121",
    blue: "#2196f3",
    blueGray: "#607d8b",
    blueGrayDark: "#37474f",
    blueGrayLight: "#eceff1",
    brown: "#795548",
    brownDark: "#4e342e",
    brownLight: "#d7ccc8",
    cyan: "#00bcd4",
    cyanDark: "#006064",
    gray: "#bdbdbd",
    grayDark: "#757575",
    grayDark2: "#424242",
    grayLight: "#eeeeee",
    green: "#4caf50",
    greenDark: "#2e7d32",
    orange: "#ff9800",
    orangeDeep: "#ff5722",
    pink: "#e91e63",
    purple: "#9c27b0",
    purpleDark: "#6a1b9a",
    red: "#f44336",
    teal: "#009688",
    tealDark: "#004d40",
    white: "#ffffff",
    yellow: "#ffeb3b",
};

const BrandColor = {
    primary: Color.red,
};

const SeverityColor = {
    danger: Color.red,
    dangerDark: Color.black,
    info: Color.blue,
};

const StateColor = {
    active: BrandColor.primary,
    disabled: Color.gray,
    temporary: Color.gray,
};

const BorderColor = {
    dark: Color.grayDark,
    light: Color.grayLight,
    normal: Color.gray,
};

const baseBorderRadius = rem(0.8);
const BorderRadius = {
    double: baseBorderRadius * 2,
    single: baseBorderRadius,
};

const baseGap = rem(0.8);
const Gap = {
    double: baseGap * 2,
    half: baseGap / 2,
    quadruple: baseGap * 4,
    single: baseGap,
    triple: baseGap * 3,
};

const FontWeightStyle = {
    bold: systemWeights.bold,
    regular: systemWeights.regular,
};

const TypographyStyle = {
    body: { ...human.bodyObject, color: Color.black },
    bodyLight: human.bodyWhiteObject,
    callout: { ...human.calloutObject, color: Color.black },
    calloutLight: human.calloutWhiteObject,
    caption1: { ...human.caption1Object, color: Color.black },
    caption1Light: human.caption1WhiteObject,
    caption2: { ...human.caption2Object, color: Color.black },
    caption2Light: human.caption2WhiteObject,
    footnote: { ...human.footnoteObject, color: Color.black },
    footnoteLight: human.footnoteWhiteObject,
    headline: { ...human.headlineObject, color: Color.black },
    headlineLight: human.headlineWhiteObject,
    largeTitle: { ...human.largeTitleObject, color: Color.black },
    largeTitleLight: human.largeTitleWhiteObject,
    subhead: { ...human.subheadObject, color: Color.black },
    subheadLight: human.subheadWhiteObject,
    title1: { ...human.title1Object, color: Color.black },
    title1Light: human.title1WhiteObject,
    title2: { ...human.title2Object, color: Color.black },
    title2Light: human.title2WhiteObject,
    title3: { ...human.title3Object, color: Color.black },
    title3Light: human.title3WhiteObject,
};

const ListStyle = {
    backgroundColor: Color.grayLight,
};

const UserListContentStyle = {
    paddingLeft: Gap.single,
    paddingRight: Gap.single,
    paddingTop: Gap.single,
};

const UserListItemStyle = {
    paddingBottom: Gap.quadruple,
};

const CardStyle = {
    backgroundColor: Color.white,
};

const TouchableStyle = {
    color: StateColor.active,
    minHeight: rem(4.8),
    minWidth: rem(4.8),
};

const IconStyle = {
    color: Color.grayDark2,
};

const smallAvatarSize = rem(3.2);
const mediumAvatarSize = smallAvatarSize * 1.5;
const largeAvatarSize = smallAvatarSize * 8;
const AvatarStyle = {
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

const ProgressBarStyle = {
    color: Color.green,
};

function rem(value: number) {
    return value * 10;
}

export {
    rem,
    FontWeightStyle,
    BorderRadius,
    TypographyStyle,
    BorderColor,
    BrandColor,
    Color,
    SeverityColor,
    StateColor,
    Gap,
    TouchableStyle,
    IconStyle,
    AvatarStyle,
    CardStyle,
    ListStyle,
    UserListContentStyle,
    UserListItemStyle,
    ProgressBarStyle,
};

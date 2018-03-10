import { TypographyStyle } from "components/common-styles";
import Text, { ITextProps } from "components/text";
import * as React from "react";
import { StyleSheet, TextStyle } from "react-native";

interface ITypographyProps extends ITextProps {
    light?: boolean;
}

const styles = StyleSheet.create({
    body: TypographyStyle.body,
    bodyLight: TypographyStyle.bodyLight,
    callout: TypographyStyle.callout,
    calloutLight: TypographyStyle.calloutLight,
    caption1: TypographyStyle.caption1,
    caption1Light: TypographyStyle.caption1Light,
    caption2: TypographyStyle.caption2,
    caption2Light: TypographyStyle.caption2Light,
    footnote: TypographyStyle.footnote,
    footnoteLight: TypographyStyle.footnoteLight,
    headline: TypographyStyle.headline,
    headlineLight: TypographyStyle.headlineLight,
    largeTitle: TypographyStyle.largeTitle,
    largeTitleLight: TypographyStyle.largeTitleLight,
    subhead: TypographyStyle.subhead,
    subheadLight: TypographyStyle.subheadLight,
    title1: TypographyStyle.title1,
    title1Light: TypographyStyle.title1Light,
    title2: TypographyStyle.title2,
    title2Light: TypographyStyle.title2Light,
    title3: TypographyStyle.title3,
    title3Light: TypographyStyle.title3Light,
});

function makeTypography(darkStyle: TextStyle, lightStyle: TextStyle) {
    class Typography extends React.Component<ITypographyProps> {
        public render() {
            const { light, style, ...restProps } = this.props;
            const newStyle = [light ? lightStyle : darkStyle, style];
            return <Text style={newStyle as any} {...restProps} />;
        }
    }

    return Typography;
}

const LargeTitleText =
    makeTypography(styles.largeTitle, styles.largeTitleLight);
const Title1Text = makeTypography(styles.title1, styles.title1Light);
const Title2Text = makeTypography(styles.title2, styles.title2Light);
const Title3Text = makeTypography(styles.title3, styles.title3Light);
const HeadlineText = makeTypography(styles.headline, styles.headlineLight);
const BodyText = makeTypography(styles.body, styles.bodyLight);
const CalloutText = makeTypography(styles.callout, styles.calloutLight);
const SubheadText = makeTypography(styles.subhead, styles.subheadLight);
const FootnoteText = makeTypography(styles.footnote, styles.footnoteLight);
const Caption1Text = makeTypography(styles.caption1, styles.caption1Light);
const Caption2Text = makeTypography(styles.caption2, styles.caption2Light);

export {
    LargeTitleText,
    Title1Text,
    Title2Text,
    Title3Text,
    HeadlineText,
    BodyText,
    CalloutText,
    SubheadText,
    FootnoteText,
    Caption1Text,
    Caption2Text,
};

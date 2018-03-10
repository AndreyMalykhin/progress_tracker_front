declare module "react-native-typography" {
    import { TextStyle } from "react-native";

    interface IIOSColors {
        red: string;
        orange: string;
        yellow: string;
        green: string;
        tealBlue: string;
        blue: string;
        purple: string;
        pink: string;

        white: string;
        customGray: string;
        lightGray: string;
        lightGray2: string;
        midGray: string;
        gray: string;
        black: string;
    }

    interface IHuman {
        caption2Object: TextStyle;
        caption1Object: TextStyle;
        footnoteObject: TextStyle;
        subheadObject: TextStyle;
        calloutObject: TextStyle;
        bodyObject: TextStyle;
        headlineObject: TextStyle;
        title3Object: TextStyle;
        title2Object: TextStyle;
        title1Object: TextStyle;
        largeTitleObject: TextStyle;

        caption2WhiteObject: TextStyle;
        caption1WhiteObject: TextStyle;
        footnoteWhiteObject: TextStyle;
        subheadWhiteObject: TextStyle;
        calloutWhiteObject: TextStyle;
        bodyWhiteObject: TextStyle;
        headlineWhiteObject: TextStyle;
        title3WhiteObject: TextStyle;
        title2WhiteObject: TextStyle;
        title1WhiteObject: TextStyle;
        largeTitleWhiteObject: TextStyle;
    }

    interface ISystemWeights {
        thin: TextStyle;
        light: TextStyle;
        regular: TextStyle;
        semibold: TextStyle;
        bold: TextStyle;
    }

    declare const iOSColors: IIOSColors;
    declare const human: IHuman;
    declare const systemWeights: ISystemWeights;

    export { iOSColors, human, systemWeights };
}

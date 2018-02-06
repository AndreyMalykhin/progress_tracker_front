declare module "react-native-image-progress" {
    import * as React from "react";
    import { ReactNode } from "react";
    import { Image as NativeImage, ImageProperties } from "react-native";

    interface IImageProps extends ImageProperties {
        indicator?: ReactNode;
        indicatorProps?: object;
        threshold?: number;
        renderError?: (error: any) => ReactNode;
        renderIndicator?:
            (progress: number, indeterminate: boolean) => ReactNode;
    }

    declare class Image extends React.Component<IImageProps> {}

    export { IImageProps };
    export default Image;
}

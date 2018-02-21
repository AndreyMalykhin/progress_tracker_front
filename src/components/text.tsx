import * as React from "react";
import { Text as TextImpl, TextProperties } from "react-native";

type ITextProps = TextProperties;

class Text extends React.Component<ITextProps> {
    public render() {
        return <TextImpl {...this.props} />;
    }
}

export default Text;

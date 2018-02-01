import * as React from "react";
import { Text as TextImpl } from "react-native";

class Text extends React.Component {
    public render() {
        return <TextImpl {...this.props}/>;
    }
}

export default Text;

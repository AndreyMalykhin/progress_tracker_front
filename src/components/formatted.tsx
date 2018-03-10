import Text from "components/text";
import * as React from "react";
import { FormattedMessage as FormattedMessageImpl } from "react-intl";

interface IFormattedProps {
    component?: React.ComponentType<any>;
    formatter: React.ComponentType<any>;
    formatterProps: IFormatterProps;
}

type IFormatterProps = { children?: any; } & {
    [prop: string]: any;
};

class Formatted extends React.PureComponent<IFormattedProps> {
    public static defaultProps: Partial<IFormattedProps> =
        { component: Text };

    public render() {
        const { formatter: Formatter, formatterProps } = this.props;
        return (
            <Formatter {...formatterProps}>
                {formatterProps.children || this.renderMsg}
            </Formatter>
        );
    }

    private renderMsg = (...parts: Array< React.ReactElement<any> >) => {
        const Component = this.props.component!;
        return <Component>{...parts}</Component>;
    }
}

export default Formatted;

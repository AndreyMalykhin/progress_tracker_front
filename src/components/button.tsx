import Touchable, { ITouchableProps } from "components/touchable";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { Button as NativeButton, StyleSheet, Text } from "react-native";

type IButtonProps = ITouchableProps;

interface IButtonTitleProps {
    msgId: string;
    msgValues?: { [key: string]: string };
}

class ButtonTitle extends React.Component<IButtonTitleProps> {
    public render() {
        const { msgId, msgValues } = this.props;
        return <FormattedMessage id={msgId} values={msgValues} />;
    }
}

// tslint:disable-next-line:max-classes-per-file
class Button extends React.Component<IButtonProps> {
    public static Title = ButtonTitle;

    public render() {
        const { children, ...restProps } = this.props;
        return (
            <Touchable {...restProps}>
                <Text style={styles.text}>{children}</Text>
            </Touchable>
        );
    }
}

const styles = StyleSheet.create({
    text: {
        color: "#0076ff",
    },
});

export { IButtonProps };
export default Button;

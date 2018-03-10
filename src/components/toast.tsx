import {
    BorderColor,
    BorderRadius,
    Color,
    Gap,
    rem,
    SeverityColor,
    TouchableStyle,
} from "components/common-styles";
import Text from "components/text";
import { BodyText } from "components/typography";
import * as React from "react";
import { StyleSheet, View } from "react-native";

interface IToastProps {
    severity: ToastSeverity;
    duration?: number;
    onClose: () => void;
    onOpen: () => void;
}

enum ToastSeverity {
    Info = "Info",
    Danger = "Danger",
}

class Toast extends React.Component<IToastProps> {
    public static defaultProps = { duration: 8000 } as IToastProps;
    private timeoutId?: number;

    public render() {
        const { children, severity } = this.props;
        const style = [styles.container, severityToStyleMap[severity]];
        return (
            <View style={style}>
                <BodyText light={true} style={styles.msg}>{children}</BodyText>
            </View>
        );
    }

    public componentWillMount() {
        this.props.onOpen();
    }

    public componentDidMount() {
        const { duration, onClose } = this.props;
        this.timeoutId = setTimeout(onClose, duration);
    }

    public componentWillUnmount() {
        clearTimeout(this.timeoutId!);
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderRadius: BorderRadius.single,
        marginBottom: Gap.single,
        marginLeft: Gap.single,
        marginRight: Gap.single,
        marginTop: Gap.single,
        minWidth: rem(25.6),
        paddingBottom: Gap.double,
        paddingLeft: Gap.double,
        paddingRight: Gap.double,
        paddingTop: Gap.double,
    },
    containerDangerous: {
        backgroundColor: SeverityColor.dangerDark,
    },
    containerInformational: {
        backgroundColor: SeverityColor.info,
    },
    msg: {},
});

const severityToStyleMap = {
    [ToastSeverity.Danger]: styles.containerDangerous,
    [ToastSeverity.Info]: styles.containerInformational,
};

export { ToastSeverity };
export default Toast;

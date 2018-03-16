import AnimatableView from "components/animatable-view";
import {
    BorderRadius,
    Color,
    Gap,
    rem,
    SeverityColor,
    ShadeColor,
    TouchableStyle,
} from "components/common-styles";
import Text from "components/text";
import { BodyText } from "components/typography";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import * as Animatable from "react-native-animatable";

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

Animatable.initializeRegistryWithDefinitions({
    toastSlideInUp: {
        from: { translateY: 128 },
        to: { translateY: 0 },
    },
    toastSlideOutDown: {
        from: { translateY: 0 },
        to: { translateY: 128 },
    },
});

class Toast extends React.Component<IToastProps> {
    public static defaultProps = { duration: 8000 } as IToastProps;
    private timeoutId?: number;
    private ref?: Animatable.View;

    public render() {
        const { children, severity } = this.props;
        const style = [styles.container, severityToStyleMap[severity]];
        return (
            <AnimatableView
                onRef={this.onRef as any}
                style={style}
            >
                <BodyText light={true} style={styles.msg}>{children}</BodyText>
            </AnimatableView>
        );
    }

    public componentDidMount() {
        (this.ref as any).toastSlideInUp();
        const { duration, onClose, onOpen } = this.props;

        this.timeoutId = setTimeout(async () => {
            if (this.ref) {
                await (this.ref as any).toastSlideOutDown!();
            }

            onClose();
        }, duration);

        onOpen();
    }

    public componentWillUnmount() {
        clearTimeout(this.timeoutId!);
    }

    private onRef = (ref?: Animatable.View) => this.ref = ref;
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
        backgroundColor: SeverityColor.danger2,
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

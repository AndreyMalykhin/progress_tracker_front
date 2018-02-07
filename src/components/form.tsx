import Button, {
    ButtonIcon,
    ButtonTitle,
    IButtonProps,
} from "components/button";
import TouchableWithFeedback from "components/touchable-with-feedback";
import * as React from "react";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextInputProperties,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface IFormSectionProps {
    msgId: string;
    isExpanded?: boolean;
    onChangeExpanded: (isExpanded: boolean) => void;
    onRenderChildren: () => JSX.Element;
}

interface IFormSectionTitleProps {
    msgId: string;
    isExpanded?: boolean;
    onPress: (isExpanded: boolean) => void;
}

interface IFormGroupProps  {
    horizontal?: boolean;
    errorMsgId?: string|null;
    labelMsgId?: string;
    hintMsgId?: string;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
}

interface IMessageProps {
    msgId: string;
    msgValues?: { [key: string]: string };
}

type IFormErrorProps = IMessageProps;

type IFormLabelProps = IMessageProps & {
    style?: StyleProp<TextStyle>;
    disabled?: boolean;
    invalid?: boolean;
};

type IFormHintProps = IMessageProps & {
    disabled?: boolean;
};

type IFormButtonOkProps = IButtonProps;

type IFormButtonCancelProps = IButtonProps;

class FormBody extends React.Component {
    public render() {
        return <View style={styles.body}>{this.props.children}</View>;
    }
}

// tslint:disable-next-line:max-classes-per-file
class FormFooter extends React.Component {
    public render() {
        return <View style={styles.footer}>{this.props.children}</View>;
    }
}

// tslint:disable-next-line:max-classes-per-file
class FormGroup extends React.Component<IFormGroupProps> {
    public render() {
        const {
            horizontal,
            errorMsgId,
            labelMsgId,
            hintMsgId,
            disabled,
            style,
            labelStyle,
            children,
        } = this.props;
        let label;

        if (labelMsgId) {
            label = (
                <FormLabel
                    disabled={disabled}
                    invalid={errorMsgId != null}
                    msgId={labelMsgId}
                    style={labelStyle}
                />
            );
        }

        let hint;

        if (hintMsgId) {
            hint = <FormHint disabled={disabled} msgId={hintMsgId} />;
        }

        const contentStyle =
            horizontal ? groupContentHorizontalStyle : styles.groupContent;
        return (
            <View style={[styles.group, style]}>
                <View style={contentStyle}>
                    {label}
                    {children}
                </View>
                {errorMsgId && <FormError msgId={errorMsgId} />}
                {hint}
            </View>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class FormSection extends React.Component<IFormSectionProps> {
    public render() {
        const { msgId, isExpanded, onChangeExpanded, onRenderChildren } =
            this.props;
        return (
            <View>
                <FormSectionTitle
                    msgId={msgId}
                    isExpanded={isExpanded}
                    onPress={onChangeExpanded}
                />
                {isExpanded && onRenderChildren()}
            </View>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class FormSectionTitle extends React.PureComponent<IFormSectionTitleProps> {
    public render() {
        const iconName = this.props.isExpanded ? "chevron-up" : "chevron-down";
        return (
            <TouchableWithFeedback onPress={this.onPress}>
                <FormGroup
                    labelStyle={styles.sectionTitle}
                    labelMsgId={this.props.msgId}
                    horizontal={true}
                >
                    <Icon
                        style={styles.sectionIcon}
                        name={iconName}
                        size={32}
                    />
                </FormGroup>
            </TouchableWithFeedback>
        );
    }

    private onPress = () => {
        this.props.onPress(!this.props.isExpanded);
    }
}

// tslint:disable-next-line:max-classes-per-file
class FormError extends React.PureComponent<IFormErrorProps> {
    public render() {
        const { msgId, msgValues } = this.props;
        return (
            <Text style={styles.error}>
                <FormattedMessage id={msgId} values={msgValues} />
            </Text>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class FormLabel extends React.PureComponent<IFormLabelProps> {
    public render() {
        const { invalid, msgId, msgValues, disabled, style } = this.props;
        const newStyle = [
            styles.label,
            style,
            disabled ? styles.labelDisabled : null,
            invalid ? styles.labelInvalid : null,
        ];
        return (
            <Text style={newStyle as any}>
                <FormattedMessage id={msgId} values={msgValues} />
            </Text>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class FormHint extends React.PureComponent<IFormHintProps> {
    public render() {
        const { msgId, msgValues, disabled } = this.props;
        const style = disabled ? hintDisabledStyle : styles.hint;
        return (
            <Text style={style}>
                <FormattedMessage id={msgId} values={msgValues} />
            </Text>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class FormButtonOk extends React.PureComponent<IFormButtonOkProps> {
    public render() {
        const { disabled } = this.props;
        return (
            <Button {...this.props}>
                <ButtonTitle
                    primary={true}
                    disabled={disabled}
                    msgId="common.ok"
                />
            </Button>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class FormButtonCancel extends React.PureComponent<IFormButtonCancelProps> {
    public render() {
        const { disabled } = this.props;
        return (
            <Button {...this.props}>
                <ButtonTitle disabled={disabled} msgId="common.cancel" />
            </Button>
        );
    }
}

const styles = StyleSheet.create({
    body: {},
    error: {
        color: "#f00",
        marginTop: 8,
    },
    footer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 8,
    },
    group: {
        padding: 16,
    },
    groupContent: {},
    groupContentHorizontal: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    hint: {
        marginTop: 8,
    },
    hintDisabled: {
        color: "#ccc",
    },
    label: {
        fontWeight: "bold",
        lineHeight: 32,
    },
    labelDisabled: {
        color: "#ccc",
    },
    labelInvalid: {
        color: "#f00",
    },
    sectionIcon: {
        color: "#0076ff",
    },
    sectionTitle: {
        color: "#0076ff",
        fontWeight: "normal",
    },
});

const hintDisabledStyle = [styles.hint, styles.hintDisabled];
const groupContentHorizontalStyle =
    [styles.groupContent, styles.groupContentHorizontal];

export {
    FormBody,
    FormFooter,
    FormGroup,
    FormError,
    FormLabel,
    FormHint,
    FormButtonOk,
    FormButtonCancel,
    FormSection,
};

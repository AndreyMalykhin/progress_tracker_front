import Button, {
    ButtonIcon,
    ButtonTitle,
    IButtonProps,
} from "components/button";
import {
    fontWeightStyle,
    gap,
    severityColor,
    stateColor,
    touchableStyle,
} from "components/common-styles";
import Icon from "components/icon";
import Text from "components/text";
import TouchableWithFeedback from "components/touchable-with-feedback";
import { BodyText, FootnoteText, SubheadText } from "components/typography";
import * as React from "react";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import {
    StyleProp,
    StyleSheet,
    TextInput,
    TextInputProperties,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";
import IconName from "utils/icon-name";

interface IFormBodyProps {
    style?: StyleProp<ViewStyle>;
}

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

class FormBody extends React.Component<IFormBodyProps> {
    public render() {
        const { style, children } = this.props;
        return <View style={[styles.body, style]}>{children}</View>;
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
        const iconName =
            this.props.isExpanded ? IconName.Expanded : IconName.Collapsed;
        return (
            <TouchableWithFeedback onPress={this.onPress}>
                <FormGroup
                    labelStyle={styles.sectionTitle}
                    labelMsgId={this.props.msgId}
                    horizontal={true}
                >
                    <Icon active={true} name={iconName} />
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
            <BodyText dangerous={true} style={styles.error}>
                <FormattedMessage id={msgId} values={msgValues} />
            </BodyText>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class FormLabel extends React.PureComponent<IFormLabelProps> {
    public render() {
        const { invalid, msgId, msgValues, disabled, style } = this.props;
        return (
            <SubheadText
                disabled={disabled}
                dangerous={invalid}
                style={[styles.label, style]}
            >
                <FormattedMessage id={msgId} values={msgValues} />
            </SubheadText>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class FormHint extends React.PureComponent<IFormHintProps> {
    public render() {
        const { msgId, msgValues, disabled } = this.props;
        return (
            <FootnoteText disabled={disabled} style={styles.hint}>
                <FormattedMessage id={msgId} values={msgValues} />
            </FootnoteText>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class FormButtonOk extends React.PureComponent<IFormButtonOkProps> {
    public render() {
        const { disabled, style, ...restProps } = this.props;
        return (
            <Button
                style={[styles.buttonOk, style]}
                disabled={disabled}
                {...restProps}
            >
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
        const { disabled, style, ...restProps } = this.props;
        return (
            <Button
                style={[styles.buttonCancel, style]}
                disabled={disabled}
                {...restProps}
            >
                <ButtonTitle disabled={disabled} msgId="common.cancel" />
            </Button>
        );
    }
}

const styles = StyleSheet.create({
    body: {},
    buttonCancel: {
        flex: 1,
    },
    buttonOk: {
        flex: 1,
    },
    error: {
        marginTop: gap.single,
    },
    footer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-around",
        paddingBottom: gap.single,
        paddingLeft: gap.single,
        paddingRight: gap.single,
        paddingTop: gap.single,
    },
    group: {
        paddingBottom: gap.double,
        paddingLeft: gap.double,
        paddingRight: gap.double,
        paddingTop: gap.double,
    },
    groupContent: {},
    groupContentHorizontal: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    hint: {
        paddingTop: gap.single,
    },
    label: {
        ...fontWeightStyle.bold,
    },
    sectionTitle: {
        ...fontWeightStyle.regular,
        color: touchableStyle.color,
    },
});

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

import Button, { ButtonIcon, ButtonTitle } from "components/button";
import {
    AvatarStyle,
    Color,
    FontWeightStyle,
    Gap,
    HeaderStyle,
    IconStyle,
    ShadeColor,
    TouchableStyle,
    TypographyStyle,
} from "components/common-styles";
import Icon from "components/icon";
import Image from "components/image";
import Text from "components/text";
import {
    BodyText,
    Caption1Text,
    Caption2Text,
    SubheadText,
    Title3Text,
} from "components/typography";
import * as React from "react";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { RouteComponentProps, withRouter } from "react-router";
import IconName from "utils/icon-name";

interface IHeaderCmd {
    iconName?: string;
    imgUrl?: string;
    isPrimary?: boolean;
    isDisabled?: boolean;
    msgId: string;
    onRun?: () => void;
}

interface ICmdProps extends IHeaderCmd {
    style?: StyleProp<ViewStyle>;
}

interface IHeaderState {
    title?: string;
    subtitleIcon?: string;
    subtitleText?: string|number;
    leftCommand?: IHeaderCmd;
    rightCommands?: IHeaderCmd[];
    hideBackCommand?: boolean;
    onBack?: () => void;
}

interface ITitleProps {
    text: string;
}

interface ISubtitleProps {
    text?: string|number;
    iconName?: string;
}

type IHeaderProps = RouteComponentProps<{}>;

class Header extends React.Component<IHeaderProps> {
    public render() {
        const locationState = this.props.location.state;

        if (!locationState || !locationState.header) {
            return <View style={styles.container} />;
        }

        let cmdIndex = 0;
        let backCmd;
        const headerState = locationState.header;

        if (!headerState.hideBackCommand && this.props.history.length > 1) {
            backCmd = this.renderBackCmd(cmdIndex, headerState.onBack);
            ++cmdIndex;
        }

        const { leftCommand, rightCommands, title, subtitleIcon, subtitleText }
            = headerState as IHeaderState;
        let leftCmdElement;

        if (leftCommand) {
            leftCmdElement = <Cmd key={cmdIndex} {...leftCommand} />;
            ++cmdIndex;
        }

        const rightCommandElements = rightCommands && rightCommands.map(
            (cmd, i) => <Cmd key={i} {...cmd} />);
        const subtitle = subtitleText != null || subtitleIcon != null ?
            <Subtitle text={subtitleText} iconName={subtitleIcon} /> : null;
        return (
            <View style={styles.container}>
                <View style={styles.leftSection}>
                    {backCmd}{leftCmdElement}
                </View>
                <View style={styles.middleSection}>
                    {title && <Title text={title} />}
                    {subtitle}
                </View>
                <View style={styles.rightSection}>{rightCommandElements}</View>
            </View>
        );
    }

    public shouldComponentUpdate(nextProps: IHeaderProps) {
        const prevLocationState = this.props.location.state;
        const nextLocationState = nextProps.location.state;
        return !(!prevLocationState && !nextLocationState
            || (prevLocationState && nextLocationState
            && prevLocationState.header === nextLocationState.header));
    }

    private renderBackCmd(index: number, onRun?: () => void) {
        return (
            <Cmd
                style={styles.cmdBack}
                key={index}
                iconName={IconName.Back}
                msgId={"commands.back"}
                onRun={onRun || this.onBackPress}
            />
        );
    }

    private onBackPress = () => this.props.history.goBack();
}

// tslint:disable-next-line:max-classes-per-file
class Cmd extends React.PureComponent<ICmdProps> {
    public render() {
        const { style, isPrimary, msgId, iconName, imgUrl, isDisabled, onRun } =
            this.props;
        let content;

        if (iconName) {
            content = (
                <ButtonIcon
                    disabled={isDisabled}
                    component={Icon}
                    name={iconName}
                />
            );
        } else if (imgUrl) {
            content = (
                <Image
                    resizeMode="cover"
                    style={styles.cmdImg}
                    source={{ uri: imgUrl }}
                />
            );
        } else {
            content = (
                <ButtonTitle
                    primary={isPrimary}
                    style={styles.cmdTitle}
                    disabled={isDisabled}
                    msgId={msgId}
                />
            );
        }

        return (
            <Button disabled={isDisabled} onPress={onRun} style={style}>
                {content}
            </Button>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class Title extends React.PureComponent<ITitleProps> {
    public render() {
        return (
            <BodyText style={styles.title} numberOfLines={1}>
                {this.props.text}
            </BodyText>
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class Subtitle extends React.PureComponent<ISubtitleProps> {
    public render() {
        const { text, iconName } = this.props;
        const icon = iconName && (
            <Icon
                style={styles.subtitleIcon}
                name={iconName}
                size={TypographyStyle.caption2.lineHeight}
            />
        );
        return (
            <View style={styles.subtitle}>
                {icon}
                <Caption2Text style={styles.subtitleText} numberOfLines={1}>
                    {text}
                </Caption2Text>
            </View>
        );
    }
}

const subtitleColor = Color.grayDark;

const styles = StyleSheet.create({
    cmdBack: {},
    cmdImg: {
        ...AvatarStyle.small,
    },
    cmdTitle: {},
    container: {
        ...HeaderStyle,
        borderBottomWidth: 1,
        flexDirection: "row",
        height: TouchableStyle.minHeight,
    },
    leftSection: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
    },
    middleSection: {
        alignItems: "center",
        flex: 2,
        justifyContent: "center",
    },
    rightSection: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    subtitle: {
        alignItems: "flex-start",
        flexDirection: "row",
    },
    subtitleIcon: {
        color: subtitleColor,
        marginLeft: Gap.half,
        marginRight: Gap.half,
    },
    subtitleText: {
        color: subtitleColor,
    },
    title: {
        ...FontWeightStyle.bold,
    },
});

export { IHeaderState, IHeaderCmd };
export default withRouter(Header);

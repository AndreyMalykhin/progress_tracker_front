import Button, { ButtonIcon, ButtonTitle } from "components/button";
import Image from "components/image";
import * as React from "react";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteComponentProps, withRouter } from "react-router";
import IconName from "utils/icon-name";

interface IHeaderCmd {
    iconName?: string;
    imgUrl?: string;
    isPrimary?: boolean;
    isDisabled?: boolean;
    msgId: string;
    onRun: () => void;
}

interface IHeaderCmdProps extends IHeaderCmd {
    style?: StyleProp<ViewStyle>;
}

interface IHeaderState {
    title?: ReactNode;
    subtitleIcon?: string;
    subtitleText?: string|number;
    leftCommand?: IHeaderCmd;
    rightCommands?: IHeaderCmd[];
    hideBackCommand?: boolean;
    onBack?: () => void;
}

interface ITitleProps {
    text: ReactNode;
}

interface ISubtitleProps {
    text?: string|number;
    iconName?: string;
}

type IHeaderProps = RouteComponentProps<{}>;

const cmdSize = 32;

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
            leftCmdElement = <HeaderCmd key={cmdIndex} {...leftCommand} />;
            ++cmdIndex;
        }

        const rightCommandElements = rightCommands && rightCommands.map(
            (cmd, i) => <HeaderCmd key={i} {...cmd} />);
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
            <HeaderCmd
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
class HeaderCmd extends React.PureComponent<IHeaderCmdProps> {
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
                    size={cmdSize}
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
        return <Text style={styles.title}>{this.props.text}</Text>;
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
                size={12}
            />
        );
        return (
            <View style={styles.subtitle}>
                {icon}
                <Text style={styles.subtitleText}>{text}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    cmdBack: {
        marginRight: 16,
    },
    cmdImg: {
        borderRadius: cmdSize / 2,
        borderWidth: 1,
        height: cmdSize,
        width: cmdSize,
    },
    cmdTitle: {},
    container: {
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        paddingLeft: 8,
        paddingRight: 8,
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
        color: "#888",
        lineHeight: 16,
        marginLeft: 4,
        marginRight: 4,
    },
    subtitleText: {
        color: "#888",
        fontSize: 12,
        lineHeight: 16,
    },
    title: {},
});

export { IHeaderState, IHeaderCmd };
export default withRouter(Header);

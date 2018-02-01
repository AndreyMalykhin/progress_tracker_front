import Button, { ButtonIcon, ButtonTitle } from "components/button";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { Image, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteComponentProps, withRouter } from "react-router";

interface IHeaderCmd {
    iconName?: string;
    imgUrl?: string;
    isDisabled?: boolean;
    msgId: string;
    onRun: () => void;
}

type IHeaderCmdProps = IHeaderCmd;

interface IHeaderState {
    title?: JSX.Element;
    subtitle?: JSX.Element;
    leftCommand?: IHeaderCmd;
    rightCommands: IHeaderCmd[];
    hideBackCommand?: boolean;
    onBack?: () => void;
}

type IHeaderProps = RouteComponentProps<{}>;

const cmdSize = 32;

class Header extends React.Component<IHeaderProps> {
    public render() {
        const { state } = this.props.location;

        if (!state) {
            return <View style={styles.container} />;
        }

        let cmdIndex = 0;
        let backCmd;

        if (!state.hideBackCommand && this.props.history.length > 1) {
            backCmd = this.renderBackCmd(cmdIndex, state.onBack);
            ++cmdIndex;
        }

        const { leftCommand, rightCommands, title, subtitle } =
            state as IHeaderState;
        let leftCmdElement;

        if (leftCommand) {
            leftCmdElement = (
                <HeaderCmd
                    key={cmdIndex}
                    iconName={leftCommand.iconName}
                    imgUrl={leftCommand.imgUrl}
                    msgId={leftCommand.msgId}
                    isDisabled={leftCommand.isDisabled}
                    onRun={leftCommand.onRun}
                />
            );
            ++cmdIndex;
        }

        const rightCommandElements = rightCommands.map((cmd, i) => {
            return (
                <HeaderCmd
                    key={i}
                    iconName={cmd.iconName}
                    imgUrl={cmd.imgUrl}
                    msgId={cmd.msgId}
                    isDisabled={cmd.isDisabled}
                    onRun={cmd.onRun}
                />
            );
        });
        return (
            <View style={styles.container}>
                <View style={styles.leftSection}>
                    {backCmd}{leftCmdElement}
                </View>
                <View style={styles.middleSection}>{title}{subtitle}</View>
                <View style={styles.rightSection}>{rightCommandElements}</View>
            </View>
        );
    }

    public shouldComponentUpdate(nextProps: IHeaderProps) {
        return this.props.location.state !== nextProps.location.state;
    }

    private renderBackCmd(index: number, onRun?: () => void) {
        return (
            <HeaderCmd
                key={index}
                iconName={"keyboard-backspace"}
                msgId={"commands.back"}
                onRun={onRun || this.onBackPress}
            />
        );
    }

    private onBackPress = () => {
        this.props.history.goBack();
    }
}

// tslint:disable-next-line:max-classes-per-file
class HeaderCmd extends React.PureComponent<IHeaderCmdProps> {
    public render() {
        const { msgId, iconName, imgUrl, isDisabled, onRun } = this.props;
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
            const source = {
                height: cmdSize,
                method: "cover",
                uri: imgUrl,
                width: cmdSize,
            };
            content = <Image source={source} />;
        } else {
            content = <ButtonTitle disabled={isDisabled} msgId={msgId} />;
        }

        return <Button disabled={isDisabled} onPress={onRun}>{content}</Button>;
    }
}

// tslint:disable-next-line:max-classes-per-file
class HeaderTitle extends React.Component {
    public render() {
        return <Text>{this.props.children}</Text>;
    }
}

// tslint:disable-next-line:max-classes-per-file
class HeaderSubtitle extends React.Component {
    public render() {
        return <Text>{this.props.children}</Text>;
    }
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "space-between",
        paddingHorizontal: 8,
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
});

export { HeaderTitle, HeaderSubtitle, IHeaderState, IHeaderCmd };
export default withRouter(Header);

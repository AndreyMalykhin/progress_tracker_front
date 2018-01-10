import Touchable, { ITouchableProps } from "components/touchable";
import * as React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteComponentProps, withRouter } from "react-router";

interface IHeaderCmd {
    iconName?: string;
    imgUrl?: string;
    msgId: string;
    action: () => void;
}

interface IHeaderState {
    title: JSX.Element;
    subtitle: JSX.Element;
    leftCommand: IHeaderCmd;
    rightCommands: IHeaderCmd[];
}

type IHeaderProps = RouteComponentProps<{}>;

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

// tslint:disable-next-line:max-classes-per-file
class Header extends React.Component<IHeaderProps> {
    public render() {
        const { state } = this.props.location;

        if (!state) {
            return <View style={styles.container} />;
        }

        let cmdIndex = 0;
        let backBtn;

        if (this.props.history.length > 1) {
            backBtn = this.renderBackCmd();
            ++cmdIndex;
        }

        const { leftCommand, rightCommands, title, subtitle } =
            state as IHeaderState;
        let leftCmdElement;

        if (leftCommand) {
            leftCmdElement = this.renderCmd(
                leftCommand.msgId,
                leftCommand.action,
                cmdIndex,
                leftCommand.iconName,
                leftCommand.imgUrl,
            );
            ++cmdIndex;
        }

        const rightCommandElements = rightCommands.map((cmd, i) => {
            return this.renderCmd(
                cmd.msgId, cmd.action, cmdIndex + i, cmd.iconName, cmd.imgUrl);
        });
        return (
            <View style={styles.container}>
                <View style={styles.leftSection}>
                    {backBtn}{leftCmdElement}
                </View>
                <View style={styles.middleSection}>{title}{subtitle}</View>
                <View style={styles.rightSection}>{rightCommandElements}</View>
            </View>
        );
    }

    private renderBackCmd() {
        const icon = "keyboard-backspace";
        const title = "commands.back";
        const index = 0;
        return this.renderCmd(title, this.onBackPress, index, icon);
    }

    private renderCmd(
        title: string,
        action: () => void,
        index: number,
        iconName?: string,
        imgUrl?: string,
    ) {
        const source = { uri: imgUrl, width: 32, height: 32, method: "cover" };
        const icon = iconName ? <Icon name={iconName} size={32} /> :
            <Image source={source} />;
        return <Touchable key={index} onPress={action}>{icon}</Touchable>;
    }

    private onBackPress() {
        const { history } = this.props;
        history.goBack();
        --history.length;
    }
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "space-between",
    },
    leftSection: {
        alignItems: "center",
        flexDirection: "row",
    },
    middleSection: {
        alignItems: "center",
    },
    rightSection: {
        alignItems: "center",
        flexDirection: "row",
    },
});

export { HeaderTitle, HeaderSubtitle, IHeaderState, IHeaderCmd };
export default withRouter(Header);

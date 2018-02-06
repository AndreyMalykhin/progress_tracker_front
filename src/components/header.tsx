import Button, { ButtonIcon, ButtonTitle } from "components/button";
import * as React from "react";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { Image, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteComponentProps, withRouter } from "react-router";

interface IHeaderCmd {
    iconName?: string;
    imgUrl?: string;
    isPrimary?: boolean;
    isDisabled?: boolean;
    msgId: string;
    onRun: () => void;
}

type IHeaderCmdProps = IHeaderCmd;

interface IHeaderState {
    title?: ReactNode;
    subtitleIcon?: string;
    subtitleText?: string|number;
    leftCommand?: IHeaderCmd;
    rightCommands: IHeaderCmd[];
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

interface IWithHeaderProps {
    header: {
        push: (state: IHeaderState) => void;
        replace: (state: IHeaderState|null) => void;
        pop: () => void;
    };
}

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

        const { leftCommand, rightCommands, title, subtitleIcon, subtitleText }
            = state as IHeaderState;
        let leftCmdElement;

        if (leftCommand) {
            leftCmdElement = <HeaderCmd key={cmdIndex} {...leftCommand} />;
            ++cmdIndex;
        }

        const rightCommandElements = rightCommands.map((cmd, i) => {
            return <HeaderCmd key={i} {...cmd} />;
        });
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
        const { isPrimary, msgId, iconName, imgUrl, isDisabled, onRun } =
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
            const source = {
                height: cmdSize,
                uri: imgUrl,
                width: cmdSize,
            };
            content = (
                <Image
                    resizeMode="cover"
                    style={styles.cmdImg}
                    source={source}
                />
            );
        } else {
            const style = isPrimary ? cmdTitlePrimaryStyle : styles.cmdTitle;
            content = (
                <ButtonTitle
                    style={style}
                    disabled={isDisabled}
                    msgId={msgId}
                />
            );
        }

        return <Button disabled={isDisabled} onPress={onRun}>{content}</Button>;
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

function withHeader<T extends IWithHeaderProps>(
    Component: React.ComponentClass<T>,
) {
    // tslint:disable-next-line:max-classes-per-file
    return class EnchancedComponent extends
        React.Component< T & RouteComponentProps<{}> > {
        public render() {
            return <Component header={this} {...this.props} />;
        }

        public replace(state: IHeaderState|null) {
            this.props.history.replace(
                Object.assign({}, this.props.location, { state } ));
        }

        public push(state: IHeaderState) {
            this.props.history.push(
                Object.assign({}, this.props.location, { state } ));
        }

        public pop() {
            this.props.history.goBack();
        }
    };
}

const styles = StyleSheet.create({
    cmdImg: {
        borderRadius: cmdSize / 2,
        borderWidth: 1,
    },
    cmdTitle: {},
    cmdTitlePrimary: {
        fontWeight: "bold",
    },
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

const cmdTitlePrimaryStyle = [styles.cmdTitle, styles.cmdTitlePrimary];

export {
    IHeaderState,
    IHeaderCmd,
    withHeader,
    IWithHeaderProps,
};
export default withRouter(Header);

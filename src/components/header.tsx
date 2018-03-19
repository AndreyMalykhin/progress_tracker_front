import AnimatableView, { IAnimatableViewProps } from "components/animatable-view";
import Avatar from "components/avatar";
import Button, { ButtonIcon, ButtonTitle } from "components/button";
import {
    avatarStyle,
    color,
    fontWeightStyle,
    gap,
    headerStyle,
    iconStyle,
    shadeColor,
    touchableStyle,
    typographyStyle,
} from "components/common-styles";
import Icon from "components/icon";
import Image from "components/image";
import { stackingSwitchAnimationDuration } from "components/stacking-switch";
import Text from "components/text";
import {
    BodyText,
    Caption1Text,
    Caption2Text,
    SubheadText,
    Title3Text,
} from "components/typography";
import { ReactNode } from "react";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import * as Animatable from "react-native-animatable";
import { RouteComponentProps, withRouter } from "react-router";
import IconName from "utils/icon-name";
import makeLog from "utils/make-log";

type IHeaderProps = RouteComponentProps<{}>;

interface IHeaderState {
    tempShape?: IHeaderShape;
    tempHistorySize?: number;
}

interface IHeaderHistoryState {
    header: IHeaderShape;
}

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

interface IHeaderShape {
    key: string;
    title?: string;
    subtitleIcon?: string;
    subtitleText?: string|number;
    leftCommand?: IHeaderCmd;
    rightCommands?: IHeaderCmd[];
    hideBackCommand?: boolean;
    animation?: HeaderAnimation;
    onBack?: () => void;
}

interface ITitleProps {
    text: string;
}

interface ISubtitleProps {
    text?: string|number;
    iconName?: string;
}

enum HeaderAnimation {
    FadeInLeft = "FadeInLeft",
    FadeInRight = "FadeInRight",
    FadeInDown = "FadeInDown",
    FadeIn = "FadeIn",
}

const log = makeLog("header");

class Header extends React.Component<IHeaderProps, IHeaderState> {
    public state: IHeaderState = {};
    private ref?: Animatable.View;
    private isAnimating = false;
    private prevHistorySize?: number;
    private pendingAnimations: Array<{
        prevShape?: IHeaderShape;
        nextShape?: IHeaderShape;
        prevHistorySize?: number;
    }> = [];

    public render() {
        log.trace("render()");
        const { tempShape, tempHistorySize } = this.state;
        const shape = tempShape || this.getShape(this.props);

        if (!shape) {
            return (
                <View style={styles.container}>
                    <AnimatableView {...this.getAnimatableProps()} />
                </View>
            );
        }

        let cmdIndex = 0;
        let backCmd;
        const historySize = tempHistorySize || this.props.history.length;

        if (!shape.hideBackCommand && historySize > 1) {
            backCmd = this.renderBackCmd(cmdIndex, shape.onBack);
            ++cmdIndex;
        }

        const { leftCommand, rightCommands, title, subtitleIcon, subtitleText }
            = shape;
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
                <AnimatableView {...this.getAnimatableProps()}>
                    <View style={styles.leftSection}>
                        {backCmd}{leftCmdElement}
                    </View>
                    <View style={styles.middleSection}>
                        {title && <Title text={title} />}
                        {subtitle}
                    </View>
                    <View style={styles.rightSection}>
                        {rightCommandElements}
                    </View>
                </AnimatableView>
            </View>
        );
    }

    public componentWillReceiveProps(nextProps: IHeaderProps) {
        const nextShape = this.getShape(nextProps);
        const prevShape = this.getShape(this.props);

        if (prevShape !== nextShape
            && ((prevShape && prevShape.key) !== (nextShape && nextShape.key))
            && ((prevShape && prevShape.animation)
                || (nextShape && nextShape.animation))
        ) {
            this.pendingAnimations.push({
                nextShape,
                prevHistorySize: this.prevHistorySize,
                prevShape,
            });
            this.animate();
        }
    }

    public shouldComponentUpdate(
        nextProps: IHeaderProps, nextState: IHeaderState,
    ) {
        return this.getShape(this.props) !== this.getShape(nextProps)
            || this.state.tempShape !== nextState.tempShape;
    }

    public componentDidUpdate() {
        this.prevHistorySize = this.props.history.length;
    }

    private getAnimatableProps() {
        return {
            duration: stackingSwitchAnimationDuration / 2,
            onRef: this.onRef,
            style: styles.content,
        } as IAnimatableViewProps;
    }

    private async animate() {
        log.trace("animate(); isAnimating=%o; pendingAnimationCount=%o",
            this.isAnimating, this.pendingAnimations.length);

        if (this.isAnimating || !this.pendingAnimations.length) {
            return;
        }

        this.isAnimating = true;
        const { nextShape, prevShape, prevHistorySize } =
            this.pendingAnimations.shift()!;

        if (this.ref && prevShape) {
            const { exitAnimation } = this.mapAnimation(prevShape.animation);

            if (exitAnimation) {
                this.setState(
                    { tempShape: prevShape, tempHistorySize: prevHistorySize });
                log.trace("animate(); exit start");
                await this.ref[exitAnimation]!();
                log.trace("animate(); exit end");
                this.setState(
                    { tempShape: undefined, tempHistorySize: undefined });
            }
        }

        if (this.ref && nextShape) {
            const { enterAnimation } = this.mapAnimation(nextShape.animation);

            if (enterAnimation) {
                log.trace("animate(); enter start");
                await this.ref[enterAnimation]!();
                log.trace("animate(); enter end");
            } else {
                this.ref.stopAnimation();
            }
        }

        this.isAnimating = false;
        await this.animate();
    }

    private mapAnimation(animation?: HeaderAnimation) {
        let enterAnimation: Animatable.Animation | undefined;
        let exitAnimation: Animatable.Animation | undefined;

        switch (animation) {
            case HeaderAnimation.FadeInDown:
            enterAnimation = "fadeInDown";
            exitAnimation = "fadeOutUp";
            break;
            case HeaderAnimation.FadeInRight:
            enterAnimation = "fadeInRight";
            exitAnimation = "fadeOutLeft";
            break;
            case HeaderAnimation.FadeInLeft:
            enterAnimation = "fadeInLeft";
            exitAnimation = "fadeOutRight";
            break;
            case HeaderAnimation.FadeIn:
            enterAnimation = "fadeIn";
            exitAnimation = "fadeOut";
            break;
        }

        return { enterAnimation, exitAnimation };
    }

    private getShape(props: IHeaderProps) {
        const historyState: IHeaderHistoryState = props.location.state;
        return historyState && historyState.header;
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

    private onRef = (ref?: Animatable.View) => this.ref = ref;
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
        } else if (imgUrl != null) {
            content = <Avatar size="small" uri={imgUrl} />;
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
                size={typographyStyle.caption2.lineHeight}
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

const subtitleColor = color.grayDark;

const styles = StyleSheet.create({
    cmdBack: {},
    cmdTitle: {},
    container: {
        ...headerStyle,
        borderBottomWidth: 1,
        height: touchableStyle.minHeight,
    },
    content: {
        flex: 1,
        flexDirection: "row",
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
        marginLeft: gap.half,
        marginRight: gap.half,
    },
    subtitleText: {
        color: subtitleColor,
    },
    title: {
        ...fontWeightStyle.bold,
    },
});

export { IHeaderShape, IHeaderHistoryState, IHeaderCmd, HeaderAnimation };
export default withRouter(Header);

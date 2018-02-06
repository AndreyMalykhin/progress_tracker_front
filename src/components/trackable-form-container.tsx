import { IHeaderState, IWithHeaderProps } from "components/header";
import { debounce, throttle } from "lodash";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps } from "react-router";

interface ITrackable {
    id: string;
    title: string;
    iconName: string;
    isPublic: boolean;
}

interface ITrackableFormContainerProps<T extends ITrackable>
    extends RouteComponentProps<{}>, IWithHeaderProps {
    trackable?: T;
    isUserLoggedIn: boolean;
}

interface ITrackableFormContainerState {
    title?: string;
    titleError?: string|null;
    iconName: string;
    isPublic: boolean;
    isIconPickerOpen?: boolean;
}

abstract class TrackableFormContainer<
    TTrackable extends ITrackable,
    TProps extends ITrackableFormContainerProps<TTrackable>,
    TState extends ITrackableFormContainerState
> extends React.Component<TProps, TState> {
    public state = {} as TState;
    protected saveDelay = 512;
    protected icons = [
        "access-point", "access-point-network", "account", "account-alert",
        "account-box", "account-box-outline", "account-card-details",
        "account-check", "account-circle", "account-convert", "account-edit",
        "account-key", "account-location", "account-minus", "account-multiple",
        "account-multiple-minus",
    ];

    public constructor(props: TProps, context: any) {
        super(props, context);
        this.validateAndSaveTitle =
            debounce(this.validateAndSaveTitle, this.saveDelay);
    }

    public componentWillMount() {
        let state;

        if (this.isNew()) {
            state = Object.assign({ isPublic: this.props.isUserLoggedIn },
                this.getInitialStateForAdd());
        } else {
            const { iconName, isPublic, title } = this.props.trackable!;
            state = Object.assign({
                iconName,
                isPublic,
                title,
            }, this.getInitialStateForEdit());
        }

        this.setState(state, () => {
            this.updateHeader(this.isValid(this.state));
        });
    }

    public componentWillUpdate(nextProps: TProps, nextState: TState) {
        const nextIsValid = this.isValid(nextState);

        if (this.isValid(this.state) !== nextIsValid) {
            this.updateHeader(nextIsValid);
        }
    }

    protected abstract getTitleMsgId(): string;
    protected abstract addTrackable(): Promise<void>;
    protected abstract saveTitle(title: string): void;
    protected abstract saveIconName(iconName: string): void;
    protected abstract isValidForAdd(state: TState): boolean;
    protected abstract isValidForEdit(state: TState): boolean;
    protected abstract getInitialStateForAdd(): TState;
    protected abstract getInitialStateForEdit(): TState;

    protected goBack() {
        this.props.history.goBack();
    }

    protected isPublicDisabled(isNew: boolean, isUserLoggedIn: boolean) {
        return !isNew || !isUserLoggedIn;
    }

    protected isValid(state: TState) {
        if (this.isNew()) {
            return state.titleError === null && this.isValidForAdd(state);
        }

        return !state.titleError && this.isValidForEdit(state);
    }

    protected isNew() {
        return !this.props.trackable;
    }

    protected onChangeTitle = (title: string) => {
        this.setState({ title });
        this.validateAndSaveTitle(title);
    }

    protected onChangeIcon = (iconName: string) => {
        this.setState({ iconName, isIconPickerOpen: false });
        this.props.header.pop();

        if (this.isNew()) {
            return;
        }

        this.saveIconName(iconName);
    }

    protected onToggleIconPicker = () => {
        this.setState((prevState) => {
            const isIconPickerOpen = !prevState.isIconPickerOpen;

            if (isIconPickerOpen) {
                this.props.header.push({
                    onBack: this.onCloseIconPicker,
                    rightCommands: [],
                    title: <FormattedMessage id="trackableForm.iconLabel" />,
                });
            }

            return { isIconPickerOpen };
        });
    }

    protected onChangePublic = (isPublic: boolean) => {
        this.setState({ isPublic });
    }

    private validateAndSaveTitle = (title: string) => {
        const titleError = !title ? "errors.emptyValue" : null;
        this.setState({ titleError });

        if (titleError || this.isNew()) {
            return;
        }

        this.saveTitle(title);
    }

    private onCloseIconPicker = () => {
        this.props.header.pop();
        this.onToggleIconPicker();
    }

    private updateHeader(isValid: boolean) {
        this.props.header.replace({
            hideBackCommand: !this.isNew(),
            rightCommands: [
                {
                    isDisabled: !isValid,
                    msgId: "common.done",
                    onRun: this.onDone,
                },
            ],
            title: <FormattedMessage id={this.getTitleMsgId()} />,
        });
    }

    private onDone = async () => {
        if (this.isNew()) {
            try {
                await this.addTrackable();
            } catch (e) {
                // TODO
                throw e;
            }
        }

        this.goBack();
    }
}

export {
    ITrackable,
    ITrackableFormContainerProps,
    ITrackableFormContainerState,
};
export default TrackableFormContainer;

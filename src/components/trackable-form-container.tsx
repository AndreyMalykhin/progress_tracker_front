import { share } from "actions/share-action";
import { addGenericErrorToast } from "actions/toast-helpers";
import { isApolloError } from "apollo-client/errors/ApolloError";
import { IHeaderState } from "components/header";
import { ITrackableFormProps } from "components/trackable-form";
import { IWithDIContainerProps } from "components/with-di-container";
import { IWithHeaderProps } from "components/with-header";
import { debounce, throttle } from "lodash";
import TrackableType from "models/trackable-type";
import * as React from "react";
import { withApollo } from "react-apollo";
import { FormattedMessage, InjectedIntlProps } from "react-intl";
import { RouteComponentProps } from "react-router";
import { IWithApolloProps } from "utils/interfaces";
import Sound from "utils/sound";

interface ITrackable {
    id: string;
    title: string;
    iconName: string;
    isPublic: boolean;
}

interface IEditTrackableFragment {
    id: string;
    title?: string;
    iconName?: string;
}

interface ITrackableFormContainerProps<T extends ITrackable> extends
    RouteComponentProps<{}>,
    IWithHeaderProps,
    IWithApolloProps,
    IWithDIContainerProps,
    InjectedIntlProps {
    trackable?: T;
    isUserLoggedIn: boolean;
    isOnline?: boolean;
}

interface ITrackableFormContainerState {
    title?: string;
    titleError?: string|null;
    iconName: string;
    isPublic: boolean;
    isIconPickerOpen?: boolean;
    share?: boolean;
}

const icons = [
    "access-point", "access-point-network", "account", "account-alert",
    "account-box", "account-box-outline", "account-card-details",
    "account-check", "account-circle", "account-convert", "account-edit",
    "account-key", "account-location", "account-minus", "account-multiple",
    "account-multiple-minus",
];

abstract class TrackableFormContainer<
    TTrackable extends ITrackable,
    TEditTrackableFragment extends IEditTrackableFragment,
    TProps extends ITrackableFormContainerProps<TTrackable>,
    TState extends ITrackableFormContainerState
> extends React.Component<TProps, TState> {
    public state = {} as TState;
    protected saveDelay = 512;

    public constructor(props: TProps, context: any) {
        super(props, context);
        this.saveTitle = debounce(this.saveTitle, this.saveDelay);
    }

    public componentWillMount() {
        this.init(this.props, () => {
            this.updateHeader(this.isValid(this.state));
        });
    }

    public componentDidUpdate(prevProps: TProps, prevState: TState) {
        const isValid = this.isValid(this.state);

        if (isValid !== this.isValid(prevState)) {
            this.updateHeader(isValid);
        }
    }

    protected abstract getTitleMsgId(): string;
    protected abstract addTrackable(): Promise<any>;
    protected abstract doEditTrackable(
        trackable: TEditTrackableFragment): Promise<any>;
    protected abstract isValidForAdd(state: TState): boolean;
    protected abstract isValidForEdit(state: TState): boolean;
    protected abstract getInitialStateForAdd(): TState;
    protected abstract getInitialStateForEdit(): TState;
    protected abstract getTrackableType(): TrackableType;

    protected getFormBaseProps() {
        const {
            title,
            titleError,
            iconName,
            isPublic,
            isIconPickerOpen,
            share: shareWithFriends,
        } = this.state;
        const { isUserLoggedIn, isOnline } = this.props;
        const isNew = this.isNew();
        return {
            availableIconNames: icons,
            iconName,
            isIconPickerOpen,
            isPublic,
            isPublicDisabled: this.isPublicDisabled(isNew, isUserLoggedIn),
            isShareDisabled: !isUserLoggedIn || !isOnline,
            isShareable: isNew,
            onChangeIcon: this.onChangeIcon,
            onChangePublic: this.onChangePublic,
            onChangeShare: this.onChangeShare,
            onChangeTitle: this.onChangeTitle,
            onOpenIconPicker: this.onToggleIconPicker,
            share: shareWithFriends,
            title,
            titleError,
        } as ITrackableFormProps;
    }

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
        this.saveTitle(title);
    }

    protected onChangeIcon = (iconName: string) => {
        this.setState({ iconName, isIconPickerOpen: false });
        this.props.header.pop();

        if (this.isNew()) {
            return;
        }

        this.editTrackable({ iconName } as TEditTrackableFragment);
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

    protected editTrackable(fragment: Partial<TEditTrackableFragment>) {
        this.transaction(() => {
            const data =
                Object.assign({ id: this.props.trackable!.id }, fragment);
            return this.doEditTrackable(data as TEditTrackableFragment);
        });
    }

    protected async transaction(action: () => Promise<any>) {
        try {
            await action();
        } catch (e) {
            this.init(this.props);
        }
    }

    protected onChangeShare = (value: boolean) =>
        this.setState({ share: value })

    private saveTitle = (title: string) => {
        const titleError = !title ? "errors.emptyValue" : null;
        this.setState({ titleError });

        if (titleError || this.isNew()) {
            return;
        }

        this.editTrackable({ title } as TEditTrackableFragment);
    }

    private init(props: TProps, onDone?: () => void) {
        let state;
        const isNew = this.isNew();

        if (isNew) {
            const { isUserLoggedIn, isOnline } = this.props;
            state = Object.assign({
                isPublic: isUserLoggedIn,
                share: isUserLoggedIn && isOnline,
            }, this.getInitialStateForAdd());
        } else {
            const { iconName, isPublic, title } = this.props.trackable!;
            state = Object.assign({
                iconName,
                isPublic,
                title,
            }, this.getInitialStateForEdit());
        }

        this.setState(state, onDone);
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

                if (this.state.share) {
                    await this.shareTrackable();
                }
            } catch (e) {
                if (!isApolloError(e)) {
                    addGenericErrorToast(this.props.client);
                }

                return;
            }
        }

        this.goBack();
    }

    private shareTrackable() {
        return share("share.newTrackable", this.props.intl,
            { type: this.getTrackableType(), title: this.state.title! });
    }
}

export {
    ITrackable,
    ITrackableFormContainerProps,
    ITrackableFormContainerState,
    IEditTrackableFragment,
};
export default TrackableFormContainer;

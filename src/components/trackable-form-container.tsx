import { addGenericErrorToast } from "actions/toast-helpers";
import { isApolloError } from "apollo-client/errors/ApolloError";
import { HeaderAnimation } from "components/header";
import { ITrackableFormProps } from "components/trackable-form";
import { IWithDIContainerProps } from "components/with-di-container";
import { IWithHeaderProps } from "components/with-header";
import { debounce } from "lodash";
import TrackableType from "models/trackable-type";
import * as React from "react";
import { InjectedIntlProps } from "react-intl";
import { LayoutAnimation } from "react-native";
import { RouteComponentProps } from "react-router";
import Analytics, { IAnalyticsParams } from "utils/analytics";
import AnalyticsEvent from "utils/analytics-event";
import formSaveDelay from "utils/form-save-delay";
import { IWithApolloProps } from "utils/interfaces";
import makeLog from "utils/make-log";

interface ITrackable {
    id: string;
    title: string;
}

interface IEditTrackableFragment {
    id: string;
    title?: string;
}

interface ITrackableFormContainerProps<T extends ITrackable>
    extends RouteComponentProps<{}>,
    IWithHeaderProps,
    IWithApolloProps,
    IWithDIContainerProps,
    InjectedIntlProps {
    trackable?: T;
}

interface ITrackableFormContainerState {
    title?: string;
    titleError?: string|null;
}

const log = makeLog("trackable-form-container");

abstract class TrackableFormContainer<
    TTrackable extends ITrackable,
    TEditTrackableFragment extends IEditTrackableFragment,
    TProps extends ITrackableFormContainerProps<TTrackable>,
    TState extends ITrackableFormContainerState
> extends React.Component<TProps, TState> {
    public state = {} as TState;
    protected saveDelay = formSaveDelay;

    public constructor(props: TProps, context: any) {
        super(props, context);
        this.saveTitle = debounce(this.saveTitle, this.saveDelay);
    }

    public componentWillMount() {
        this.init(this.props, () => {
            const isInitial = true;
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
    protected abstract afterAddTrackable(): Promise<any>;
    protected abstract getAnalyticsParamsForAdd(): IAnalyticsParams;

    protected getFormBaseProps() {
        const {
            title,
            titleError,
        } = this.state;
        const isNew = this.isNew();
        return {
            onChangeTitle: this.onChangeTitle,
            title,
            titleError,
        } as ITrackableFormProps;
    }

    protected goBack() {
        this.props.history.goBack();
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

    private saveTitle = (title: string) => {
        const titleError = !title ? "errors.emptyValue" : null;

        // TODO fix unmounted component scenario
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
            state = this.getInitialStateForAdd();
        } else {
            const { title } = this.props.trackable!;
            state = Object.assign({ title }, this.getInitialStateForEdit());
        }

        this.setState(state, onDone);
    }

    private updateHeader(isValid: boolean) {
        const title = this.props.intl.formatMessage(
            { id: this.getTitleMsgId() });
        const leftCommand = this.isNew() ? {
            msgId: "common.cancel",
            onRun: this.onCancel,
        } : undefined;
        this.props.header.replace({
            animation: HeaderAnimation.FadeInRight,
            hideBackCommand: true,
            key: "trackableFormContainer.index",
            leftCommand,
            rightCommands: [
                {
                    isDisabled: !isValid,
                    isPrimary: true,
                    msgId: "common.done",
                    onRun: this.onDone,
                },
            ],
            title,
        });
    }

    private onCancel = () => {
        this.logCloseEvent(this.isNew());
        this.goBack();
    }

    private onDone = async () => {
        if (this.isNew()) {
            Analytics.log(AnalyticsEvent.TrackableFormSubmit, {
                type: this.getTrackableType(),
                ...this.getAnalyticsParamsForAdd(),
            });
            LayoutAnimation.easeInEaseOut();

            try {
                await this.addTrackable();
            } catch (e) {
                if (!isApolloError(e)) {
                    addGenericErrorToast(this.props.client);
                }

                return;
            }

            await this.afterAddTrackable();
        } else {
            this.logCloseEvent();
        }

        this.goBack();
    }

    private logCloseEvent(isNewTrackable?: boolean) {
        Analytics.log(AnalyticsEvent.TrackableFormClose,
            { isNew: isNewTrackable ? 1 : 0 });
    }
}

export {
    ITrackable,
    ITrackableFormContainerProps,
    ITrackableFormContainerState,
    IEditTrackableFragment,
};
export default TrackableFormContainer;

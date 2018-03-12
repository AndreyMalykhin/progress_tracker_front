import { addGenericErrorToast } from "actions/toast-helpers";
import { isApolloError } from "apollo-client/errors/ApolloError";
import { ITrackableFormProps } from "components/trackable-form";
import { IWithDIContainerProps } from "components/with-di-container";
import { IWithHeaderProps } from "components/with-header";
import { debounce } from "lodash";
import TrackableType from "models/trackable-type";
import * as React from "react";
import { InjectedIntlProps } from "react-intl";
import { RouteComponentProps } from "react-router";
import { IWithApolloProps } from "utils/interfaces";

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
    protected abstract afterAddTrackable(): Promise<any>;

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
        this.props.header.replace({
            hideBackCommand: !this.isNew(),
            rightCommands: [
                {
                    isDisabled: !isValid,
                    msgId: "common.done",
                    onRun: this.onDone,
                },
            ],
            title,
        });
    }

    private onDone = async () => {
        if (this.isNew()) {
            try {
                await this.addTrackable();
            } catch (e) {
                if (!isApolloError(e)) {
                    addGenericErrorToast(this.props.client);
                }

                return;
            }

            await this.afterAddTrackable();
        }

        this.goBack();
    }
}

export {
    ITrackable,
    ITrackableFormContainerProps,
    ITrackableFormContainerState,
    IEditTrackableFragment,
};
export default TrackableFormContainer;

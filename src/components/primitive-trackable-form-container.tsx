import { share } from "actions/share-action";
import { addGenericErrorToast } from "actions/toast-helpers";
import { isApolloError } from "apollo-client/errors/ApolloError";
import { HeaderAnimation, IHeaderShape } from "components/header";
import {
    IPrimitiveTrackableFormProps,
} from "components/primitive-trackable-form";
import TrackableFormContainer, {
    IEditTrackableFragment,
    ITrackable,
    ITrackableFormContainerProps,
    ITrackableFormContainerState,
} from "components/trackable-form-container";
import { IWithDIContainerProps } from "components/with-di-container";
import { IWithHeaderProps } from "components/with-header";
import { debounce, throttle } from "lodash";
import TrackableType from "models/trackable-type";
import * as React from "react";
import { withApollo } from "react-apollo";
import { FormattedMessage, InjectedIntlProps } from "react-intl";
import * as Animatable from "react-native-animatable";
import { RouteComponentProps } from "react-router";
import { IWithApolloProps } from "utils/interfaces";
import Sound from "utils/sound";

interface IPrimitiveTrackable extends ITrackable {
    iconName: string;
    isPublic: boolean;
}

interface IEditPrimitiveTrackableFragment extends IEditTrackableFragment {
    iconName?: string;
}

interface IPrimitiveTrackableFormContainerProps<T extends IPrimitiveTrackable>
    extends ITrackableFormContainerProps<T> {
    isUserLoggedIn: boolean;
    isOnline?: boolean;
}

interface IPrimitiveTrackableFormContainerState extends
    ITrackableFormContainerState {
    iconName: string;
    isPublic: boolean;
    isIconPickerOpen?: boolean;
    share?: boolean;
}

// TODO
const icons = [
    "access-point", "access-point-network", "account", "account-alert",
    "account-box", "account-box-outline", "account-card-details",
    "account-check", "account-circle", "account-convert", "account-edit",
    "account-key", "account-location", "account-minus", "account-multiple",
    "account-multiple-minus",
];

abstract class PrimitiveTrackableFormContainer<
    TTrackable extends IPrimitiveTrackable,
    TEditTrackableFragment extends IEditPrimitiveTrackableFragment,
    TProps extends IPrimitiveTrackableFormContainerProps<TTrackable>,
    TState extends IPrimitiveTrackableFormContainerState
> extends TrackableFormContainer<
    TTrackable,
    TEditTrackableFragment,
    TProps,
    TState
> {
    private iconPickerRef?: Animatable.View;

    protected getFormBaseProps() {
        const {
            iconName,
            isPublic,
            isIconPickerOpen,
            share: shareWithFriends,
        } = this.state;
        const { isUserLoggedIn, isOnline } = this.props;
        const isNew = this.isNew();
        return {
            ...super.getFormBaseProps(),
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
            onIconPickerRef: this.onIconPickerRef,
            onOpenIconPicker: this.onOpenIconPicker,
            share: shareWithFriends,
        } as IPrimitiveTrackableFormProps;
    }

    protected getInitialStateForAdd() {
        const { isUserLoggedIn, isOnline } = this.props;
        return {
            isPublic: isUserLoggedIn,
            share: isUserLoggedIn && isOnline,
        } as TState;
    }

    protected getInitialStateForEdit() {
        const { iconName, isPublic } = this.props.trackable!;
        return {
            iconName,
            isPublic,
        } as TState;
    }

    protected async afterAddTrackable() {
        if (!this.state.share) {
            return;
        }

        try {
            await this.shareTrackable();
        } catch (e) {
            addGenericErrorToast(this.props.client);
        }
    }

    protected isPublicDisabled(isNew: boolean, isUserLoggedIn: boolean) {
        return !isNew || !isUserLoggedIn;
    }

    protected onChangeIcon = async (iconName: string) => {
        await this.onCloseIconPicker();
        this.setState({ iconName });

        if (this.isNew()) {
            return;
        }

        this.editTrackable({ iconName } as TEditTrackableFragment);
    }

    protected onOpenIconPicker = () => {
        const title = this.props.intl.formatMessage(
            { id: "trackableForm.iconLabel" });
        this.props.header.push({
            animation: HeaderAnimation.FadeInRight,
            key: "primitiveTrackableFormContainer.iconPicker",
            onBack: this.onCloseIconPicker,
            rightCommands: [],
            title,
        });
        this.setState({ isIconPickerOpen: true });
    }

    protected onChangePublic = (isPublic: boolean) => {
        this.setState({ isPublic });
    }

    protected onChangeShare = (value: boolean) =>
        this.setState({ share: value })

    private onCloseIconPicker = async () => {
        this.props.header.pop();
        await this.iconPickerRef!.fadeOut!();
        this.setState({ isIconPickerOpen: false });
    }

    private shareTrackable() {
        return share("share.newTrackable", this.props.intl,
            { type: this.getTrackableType(), title: this.state.title! });
    }

    private onIconPickerRef = (ref?: Animatable.View) => {
        this.iconPickerRef = ref;

        if (ref) {
            ref.fadeIn!();
        }
    }
}

export {
    IPrimitiveTrackable,
    IPrimitiveTrackableFormContainerProps,
    IPrimitiveTrackableFormContainerState,
    IEditPrimitiveTrackableFragment,
};
export default PrimitiveTrackableFormContainer;

import { DataProxy } from "apollo-cache";
import { ToastSeverity } from "components/toast";
import gql from "graphql-tag";
import Type from "models/type";
import AudioManager from "utils/audio-manager";
import dataIdFromObject from "utils/data-id-from-object";
import defaultId from "utils/default-id";
import makeLog from "utils/make-log";
import Sound from "utils/sound";

interface IAddToastFragment {
    msg: string;
    severity: ToastSeverity;
    sound: Sound|null;
}

interface IToastFragment {
    __typename: Type;
    msg: string;
    severity: ToastSeverity;
    sound: Sound|null;
}

interface IUIFragment {
    __typename: Type;
    toasts: IToastFragment[];
}

interface IMessageFragment {
    text: string;
}

interface ISettingsFragment {
    locale: string;
}

const log = makeLog("toast-helpers");

const msgFragment = gql`
fragment AddGenericErrorToastMessageFragment on Message {
    text
}`;

const settingsFragment = gql`
fragment AddGenericErrorToastSettingsFragment on Settings {
    locale
}`;

const uiFragment = gql`
fragment AddToastUIFragment on UI {
    toasts {
        msg
        severity
        sound
    }
}`;

const fragmentId = dataIdFromObject({ __typename: Type.UI, id: defaultId })!;

function addToast(toast: IAddToastFragment, apollo: DataProxy) {
    log.trace("addToast(); toast=%o", toast);
    const ui = getToasts(apollo);
    ui.toasts.push({ __typename: Type.Toast, ...toast });
    setToasts(ui, apollo);
}

function addGenericErrorToast(apollo: DataProxy) {
    const settingsFragmentId = dataIdFromObject(
        { __typename: Type.Settings, id: defaultId })!;
    const locale = apollo.readFragment<ISettingsFragment>(
        { fragment: settingsFragment, id: settingsFragmentId })!.locale;
    const msgFragmentId = dataIdFromObject(
        { __typename: Type.Message, id: `${locale}_errors.unexpected` })!;
    const msg = apollo.readFragment<IMessageFragment>(
        { id: msgFragmentId, fragment: msgFragment })!.text;
    const toast = { msg, severity: ToastSeverity.Danger, sound: Sound.Error };
    addToast(toast, apollo);
}

function removeToast(index: number, apollo: DataProxy) {
    log.trace("removeToast(); index=%o", index);
    const ui = getToasts(apollo);
    ui.toasts.splice(index, 1);
    setToasts(ui, apollo);
}

function getToasts(apollo: DataProxy) {
    return apollo.readFragment<IUIFragment>(
        { id: fragmentId, fragment: uiFragment })!;
}

function setToasts(ui: IUIFragment, apollo: DataProxy) {
    apollo.writeFragment({ data: ui, fragment: uiFragment, id: fragmentId });
}

export { addToast, addGenericErrorToast, removeToast };

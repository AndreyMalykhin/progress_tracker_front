import { DataProxy } from "apollo-cache";
import { ToastSeverity } from "components/toast";
import gql from "graphql-tag";
import Type from "models/type";
import { MessageValue } from "react-intl";
import AudioManager from "utils/audio-manager";
import dataIdFromObject from "utils/data-id-from-object";
import defaultId from "utils/default-id";
import makeLog from "utils/make-log";
import Sound from "utils/sound";

interface IAddToastFragment {
    msgId: string;
    msgValues?: { [key: string]: MessageValue };
    severity: ToastSeverity;
    sound?: Sound;
}

interface IToastFragment {
    __typename: Type;
    msgId: string;
    msgValues: { [key: string]: MessageValue } | null;
    severity: ToastSeverity;
    sound: Sound|null;
}

interface IUIFragment {
    __typename: Type;
    toasts: IToastFragment[];
}

const log = makeLog("toast-helpers");

const uiFragment = gql`
fragment AddToastUIFragment on UI {
    toasts {
        msgId
        msgValues
        severity
        sound
    }
}`;

const fragmentId = dataIdFromObject({ __typename: Type.UI, id: defaultId })!;

function addToast(toast: IAddToastFragment, apollo: DataProxy) {
    log.trace("addToast", "toast=%o", toast);
    const ui = getToasts(apollo);
    ui.toasts.push({
        __typename: Type.Toast,
        msgId: toast.msgId,
        msgValues: toast.msgValues || null,
        severity: toast.severity,
        sound: toast.sound || null,
    });
    setToasts(ui, apollo);
}

function addGenericErrorToast(apollo: DataProxy) {
    const toast = {
        msgId: "errors.unexpected",
        severity: ToastSeverity.Danger,
        sound: Sound.Error,
    };
    addToast(toast, apollo);
}

function removeToast(index: number, apollo: DataProxy) {
    log.trace("removeToast", "index=%o", index);
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

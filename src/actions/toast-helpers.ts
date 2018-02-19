import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import Type from "models/type";
import dataIdFromObject from "utils/data-id-from-object";
import defaultId from "utils/default-id";
import makeLog from "utils/make-log";

interface IAddToastFragment {
    msg: string;
}

interface IToastFragment {
    __typename: Type;
    id: number;
    msg: string;
}

interface IUIFragment {
    __typename: Type;
    id: string;
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
    id
    text
}`;

const settingsFragment = gql`
fragment AddGenericErrorToastSettingsFragment on Settings {
    id
    locale
}`;

const uiFragment = gql`
fragment AddToastUIFragment on UI {
    id
    toasts {
        id
        msg
    }
}`;

const fragmentId = dataIdFromObject({ __typename: Type.UI, id: defaultId })!;

function addToast(toast: IAddToastFragment, apollo: DataProxy) {
    log.trace("addToast(); toast=%o", toast);
    const ui = getToasts(apollo);
    ui.toasts.push({ __typename: Type.Toast, id: ui.toasts.length, ...toast });
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
    addToast({ msg }, apollo);
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

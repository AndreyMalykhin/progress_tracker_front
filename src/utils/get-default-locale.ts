import { getDeviceLocale } from "react-native-device-info";

function getDefaultLocale() {
    let locale = getDeviceLocale();
    const isLocaleSupported = ["en"].some(
        (supportedLocale) => locale!.startsWith(supportedLocale));

    if (!isLocaleSupported) {
        locale = "en";
    }

    return locale;
}

export default getDefaultLocale;

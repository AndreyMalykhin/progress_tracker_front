import { getDeviceLocale } from "react-native-device-info";

function getDefaultLocale() {
    const deviceLocale = getDeviceLocale().split("-")[0];
    const isLocaleSupported = ["en"].indexOf(deviceLocale) !== -1;
    return isLocaleSupported ? deviceLocale : "en";
}

export default getDefaultLocale;

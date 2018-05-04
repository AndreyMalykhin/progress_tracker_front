import { getModel } from "react-native-device-info";

function isIphoneX() {
    return getModel() === "iPhone X";
}

export default isIphoneX;

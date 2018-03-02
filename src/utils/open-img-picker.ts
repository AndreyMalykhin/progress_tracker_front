import ImagePicker, { Image } from "react-native-image-crop-picker";
import makeLog from "./make-log";

const log = makeLog("open-img-picker");

async function openImgPicker() {
    try {
        return await ImagePicker.openPicker({
            compressImageMaxHeight: 640,
            compressImageMaxWidth: 640,
            compressImageQuality: 1,
            includeBase64: false,
            mediaType: "photo",
        }) as Image;
    } catch (e) {
        if (e.code === "E_PICKER_CANCELLED") {
            return null;
        }

        log.error("openImgPicker(); error=%o", e);
        throw e;
    }
}

export default openImgPicker;

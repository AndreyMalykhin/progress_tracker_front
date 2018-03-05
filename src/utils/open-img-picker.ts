import ImagePicker, { Image } from "react-native-image-crop-picker";
import AudioManager from "utils/audio-manager";
import makeLog from "utils/make-log";
import Sound from "utils/sound";

const log = makeLog("open-img-picker");

async function openImgPicker(audioManager: AudioManager) {
    try {
        return await ImagePicker.openPicker({
            compressImageMaxHeight: 640,
            compressImageMaxWidth: 640,
            compressImageQuality: 1,
            includeBase64: false,
            mediaType: "photo",
            waitAnimationEnd: false,
        }) as Image;
    } catch (e) {
        if (e.code === "E_PICKER_CANCELLED") {
            return null;
        }

        log.error("openImgPicker(); error=%o", e);
        throw e;
    } finally {
        audioManager.play(Sound.Click);
    }
}

export default openImgPicker;

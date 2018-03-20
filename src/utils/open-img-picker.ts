import { DocumentDirectoryPath, moveFile } from "react-native-fs";
import ImagePicker, { Image } from "react-native-image-crop-picker";
import AudioManager from "utils/audio-manager";
import makeLog from "utils/make-log";
import Sound from "utils/sound";
import uuid from "utils/uuid";

const log = makeLog("open-img-picker");

async function openImgPicker(audioManager: AudioManager) {
    let img;

    try {
        img = await ImagePicker.openPicker({
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

        log.error("openImgPicker", e);
        throw e;
    } finally {
        audioManager.play(Sound.Click);
    }

    const fileExtension = img.path.split(".").pop();
    const newFilePath = `${DocumentDirectoryPath}/${uuid()}.${fileExtension}`;

    try {
        await moveFile(img.path, newFilePath);
    } catch (e) {
        log.error("openImgPicker", e);
        throw e;
    }

    img.path = newFilePath;
    return img;
}

export default openImgPicker;

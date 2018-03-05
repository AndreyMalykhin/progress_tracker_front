import Sound = require("react-native-sound");
import makeLog from "utils/make-log";

const log = makeLog("audio-manager");

class AudioManager {
    private sounds: { [fileName: string]: Sound } = {};

    public constructor() {
        Sound.setCategory("Playback", false);
    }

    public loadAll(fileNames: string[]) {
        return Promise.all(fileNames.map((fileName) => this.load(fileName)));
    }

    public play(fileName: string) {
        log.trace("play(); fileName=%o", fileName);
        this.sounds[fileName].play();
    }

    private load(fileName: string) {
        return new Promise((resolve, reject) => {
            this.sounds[fileName] = new Sound(
                fileName,
                Sound.MAIN_BUNDLE,
                (error) => {
                    if (error) {
                        log.error("load(); error=%o", error);
                        reject(error);
                        return;
                    }

                    resolve();
                },
            );
        });
    }
}

export default AudioManager;

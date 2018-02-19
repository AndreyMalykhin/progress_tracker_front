import { ShareDialog, ShareLinkContent } from "react-native-fbsdk";
import makeLog from "utils/make-log";

const log = makeLog("invite-friends-action");

async function inviteFriends(msg: string, hashtag: string) {
    const shareContent: ShareLinkContent = {
        commonParameters: { hashtag: "#" + hashtag },
        contentType: "link",
        // TODO
        contentUrl: "https://itunes.apple.com/us/app/imovie/id377298193?mt=8",
        quote: msg,
    };
    const canShow = await ShareDialog.canShow(shareContent);
    log.trace("inviteFriends(); canShow=%o", canShow);

    if (!canShow) {
        return false;
    }

    let result;

    try {
        result = await ShareDialog.show(shareContent);
    } catch (e) {
        log.error("inviteFriends(); error=%o", e);
        throw e;
    }

    return true;
}

export { inviteFriends };

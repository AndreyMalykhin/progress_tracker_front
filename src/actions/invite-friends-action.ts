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
    log("inviteFriends(); canShow=%o", canShow);

    if (!canShow) {
        return;
    }

    let result;

    try {
        result = await ShareDialog.show(shareContent);
    } catch (e) {
        // TODO
        throw e;
    }

    log("inviteFriends(); result=%o", result);

    if (result.isCancelled) {
        return;
    }
}

export { inviteFriends };

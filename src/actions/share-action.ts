import { InjectedIntl, MessageValue } from "react-intl";
import { ShareDialog, ShareLinkContent } from "react-native-fbsdk";
import makeLog from "utils/make-log";

const log = makeLog("share-action");

async function share(
    msgId: string,
    translator: InjectedIntl,
    msgValues?: { [key: string]: MessageValue },
) {
    const hashtag = "#" + translator.formatMessage({ id: "common.brand" });
    const shareContent: ShareLinkContent = {
        commonParameters: { hashtag },
        contentType: "link",
        // TODO
        contentUrl: "https://itunes.apple.com/us/app/imovie/id377298193?mt=8",
        quote: translator.formatMessage({ id: msgId }, msgValues),
    };
    const canShow = await ShareDialog.canShow(shareContent);
    log.trace("share(); canShow=%o", canShow);

    if (!canShow) {
        return false;
    }

    let result;

    try {
        result = await ShareDialog.show(shareContent);
    } catch (e) {
        log.error("share(); error=%o", e);
        throw e;
    }

    return true;
}

export { share };

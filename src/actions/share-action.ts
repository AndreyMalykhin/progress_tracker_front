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
        contentUrl: "https://completoo.com",
        quote: translator.formatMessage({ id: msgId }, msgValues),
    };

    if (!await ShareDialog.canShow(shareContent)) {
        const error = new Error("Can't show share dialog");
        log.error("share", error);
        throw error;
    }

    let result;

    try {
        result = await ShareDialog.show(shareContent);
    } catch (e) {
        log.error("share", e);
        throw e;
    }

    return !result.isCancelled;
}

export { share };

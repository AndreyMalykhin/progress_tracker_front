import { AppEventsLogger, Params } from "react-native-fbsdk";
import AnalyticsEvent from "utils/analytics-event";
import makeLog from "utils/make-log";

type IAnalyticsParams = Params;

const log = makeLog("analytics");

class Analytics {
    public static log(event: AnalyticsEvent, params?: IAnalyticsParams) {
        if (this.isEnabled) {
            log.trace("log", "event=%o; params=%o", event, params);
            AppEventsLogger.logEvent(event, params || {});
        }
    }

    public static setEnabled(isEnabled: boolean) {
        log.trace("setEnabled", "%o", isEnabled);
        this.isEnabled = isEnabled;
    }

    private static isEnabled = true;
}

export { IAnalyticsParams };
export default Analytics;

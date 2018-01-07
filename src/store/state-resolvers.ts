import { completeIntroResolver } from "actions/complete-intro-action";
import { merge } from "lodash";
import messageResolver from "store/message-resolver";
import settingsResolver from "store/settings-resolver";

export default merge(
    messageResolver,
    settingsResolver,
    completeIntroResolver,
);

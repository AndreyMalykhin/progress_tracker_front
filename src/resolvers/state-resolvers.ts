import { completeIntroResolver } from "actions/complete-intro-action";
import { merge } from "lodash";
import messageResolver from "resolvers/message-resolver";
import settingsResolver from "resolvers/settings-resolver";

export default merge(
    messageResolver,
    settingsResolver,
    completeIntroResolver,
);

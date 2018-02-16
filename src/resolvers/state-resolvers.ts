import { completeIntroResolver } from "actions/complete-intro-action";
import { merge } from "lodash";
import messageResolver from "resolvers/message-resolver";
import sessionResolver from "resolvers/session-resolver";
import settingsResolver from "resolvers/settings-resolver";
import userResolver from "resolvers/user-resolver";

export default merge(
    messageResolver,
    settingsResolver,
    completeIntroResolver,
    userResolver,
    sessionResolver,
);

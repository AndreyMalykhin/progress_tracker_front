import { merge } from "lodash";
import en from "messages/en";
import { makeMessageResolver } from "resolvers/message-resolver";
import offlineResolver from "resolvers/offline-resolver";
import sessionResolver from "resolvers/session-resolver";
import { makeSettingsResolver } from "resolvers/settings-resolver";
import uiResolver from "resolvers/ui-resolver";
import userResolver from "resolvers/user-resolver";
import getDefaultLocale from "utils/get-default-locale";

function makeStateResolver() {
    return merge(
        makeMessageResolver({ en }),
        makeSettingsResolver(getDefaultLocale()),
        userResolver,
        sessionResolver,
        uiResolver,
        offlineResolver,
    );
}

export default makeStateResolver;

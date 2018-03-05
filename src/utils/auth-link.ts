import { getSession } from "actions/session-helpers";
import { setContext } from "apollo-link-context";

const authLink = setContext((request, context) => {
    const { accessToken } = getSession(context.cache);

    if (accessToken) {
        context.headers = {
            Authorization: "Bearer " + accessToken,
        };
    }

    return context;
});

export default authLink;

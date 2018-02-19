import { getSession } from "actions/session-helpers";
import { setContext } from "apollo-link-context";

const AuthLink = setContext((request, context) => {
    context.headers = {
        Authorization: "Bearer " + getSession(context.cache).accessToken,
    };
    return context;
});

export default AuthLink;

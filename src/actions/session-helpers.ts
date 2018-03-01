import { DataProxy } from "apollo-cache";
import ApolloClient from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import dataIdFromObject from "utils/data-id-from-object";
import defaultId from "utils/default-id";
import makeLog from "utils/make-log";

interface ISessionFragment {
    userId?: string;
    accessToken?: string;
}

const log = makeLog("session-helpers");

const sessionFragment = gql`
fragment SessionFragment on Session {
    userId
    accessToken
}`;

const fragmentId =
    dataIdFromObject({ __typename: Type.Session, id: defaultId })!;

function getSession(apollo: DataProxy) {
    return apollo.readFragment<ISessionFragment>(
        { id: fragmentId, fragment: sessionFragment })!;
}

function setSession(
    userId: string|null, accessToken: string|null, apollo: DataProxy,
) {
    log.trace("setSession(); userId=%o", userId);
    const session = {
        __typename: Type.Session,
        accessToken,
        userId,
    };
    apollo.writeFragment(
        { id: fragmentId, fragment: sessionFragment, data: session });
}

function isAnonymous(session: { userId?: string }) {
    return session.userId === defaultId;
}

export { getSession, setSession, isAnonymous };

import { DataProxy } from "apollo-cache";
import ApolloClient from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import dataIdFromObject from "utils/data-id-from-object";
import defaultId from "utils/default-id";

interface ISessionFragment {
    id: string;
    userId?: string;
    accessToken?: string;
}

const sessionFragment = gql`
fragment SessionFragment on Session {
    id
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
    const session = {
        __typename: Type.Session,
        accessToken,
        id: defaultId,
        userId,
    };
    apollo.writeFragment(
        { id: fragmentId, fragment: sessionFragment, data: session });
}

function isAnonymous(session: { userId?: string }) {
    return session.userId === defaultId;
}

export { getSession, setSession, isAnonymous };

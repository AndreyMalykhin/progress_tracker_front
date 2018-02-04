import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import dataIdFromObject from "utils/data-id-from-object";
import myId from "utils/my-id";

interface IEditUserResponse {
    editUser: {
        user: IStoredUserFragment;
    };
}

interface IEditUserFragment {
    name?: string;
}

interface IStoredUserFragment {
    id: string;
    name: string;
}

const editUserFragment = gql`
fragment EditUserFragment on User {
    id
    name
}`;

const editUserQuery = gql`
${editUserFragment}

mutation EditUser($user: EditUserInput!) {
    editUser(user: $user) {
        user {
            ...EditUserFragment
        }
    }
}`;

async function editUser(
    user: IEditUserFragment,
    mutate: MutationFunc<IEditUserResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(user, apollo),
        variables: { user },
    });
}

function getOptimisticResponse(
    user: IEditUserFragment, apollo: ApolloClient<NormalizedCacheObject>,
) {
    const fragmentId = dataIdFromObject({ __typename: Type.User, id: myId })!;
    const storedUser = apollo.readFragment<IStoredUserFragment>(
        { id: fragmentId, fragment: editUserFragment })!;
    Object.assign(storedUser, user);
    return {
        __typename: Type.Mutation,
        editUser: {
            __typename: Type.EditUserResponse,
            user: storedUser,
        },
    } as IEditUserResponse;
}

export {
    editUser,
    editUserQuery,
    editUserFragment,
    IEditUserResponse,
    IEditUserFragment,
};

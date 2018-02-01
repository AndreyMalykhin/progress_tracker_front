import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client/ApolloClient";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";

interface IEditTaskResponse {
    editTask: {
        task: {
            __typename: Type;
            id: string;
            title: string;
        };
    };
}

const editTaskQuery = gql`
mutation EditTask($task: EditTaskInput!) {
    editTask(task: $task) {
        task {
            id
            title
        }
    }
}`;

async function editTask(
    id: string,
    title: string,
    mutate: MutationFunc<IEditTaskResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(id, title),
        variables: { task: { id, title } },
    });
}

function getOptimisticResponse(id: string, title: string) {
    return {
        __typename: Type.Mutation,
        editTask: {
            __typename: Type.EditTaskResponse,
            task: { __typename: Type.Task, id, title },
        },
    } as IEditTaskResponse;
}

export {
    editTask,
    editTaskQuery,
    IEditTaskResponse,
};

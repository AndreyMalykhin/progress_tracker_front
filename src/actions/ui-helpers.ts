import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import Type from "models/type";
import dataIdFromObject from "utils/data-id-from-object";
import defaultId from "utils/default-id";

const setContextModeFragment = gql`
fragment SetContextModeUIFragment on UI {
    isContextMode
}`;

const fragmentId = dataIdFromObject({ __typename: Type.UI, id: defaultId })!;

function setContextMode(isOn: boolean, apollo: DataProxy) {
    apollo.writeFragment({
        data: { __typename: Type.UI, isContextMode: isOn },
        fragment: setContextModeFragment,
        id: fragmentId,
    });
}

export { setContextMode };

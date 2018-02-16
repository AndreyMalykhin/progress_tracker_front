import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import Type from "models/type";
import dataIdFromObject from "utils/data-id-from-object";
import defaultId from "utils/default-id";

const setContextModeFragment = gql`
fragment SetContextModeUIFragment on UI {
    id
    isContextMode
}`;

function setContextMode(isOn: boolean, apollo: DataProxy) {
    const ui = {
        __typename: Type.UI,
        id: defaultId,
        isContextMode: isOn,
    };
    apollo.writeFragment({
        data: ui,
        fragment: setContextModeFragment,
        id: dataIdFromObject(ui)!,
    });
}

export { setContextMode };

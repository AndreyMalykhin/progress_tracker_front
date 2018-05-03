import { getSession } from "actions/session-helpers";
import { uploadAssetOperationName } from "actions/upload-asset-action";
import { uploadAvatarOperationName } from "actions/upload-avatar-action";
import { DataProxy } from "apollo-cache";
import { ApolloError } from "apollo-client";
import { ApolloLink, NextLink, Observable, Operation } from "apollo-link";
import { parseAndCheckHttpResponse } from "apollo-link-http-common";
import { IEnvConfig } from "utils/env-config";
import makeLog from "utils/make-log";

const log = makeLog("upload-link");

class UploadLink extends ApolloLink {
    private envConfig: IEnvConfig;

    constructor(envConfig: IEnvConfig) {
        super();
        this.envConfig = envConfig;
    }

    public request(operation: Operation, forward?: NextLink) {
        const { operationName } = operation;
        const apollo: DataProxy = operation.getContext().cache;

        if (operationName === uploadAssetOperationName) {
            const { id, filePath, mimeType } = operation.variables;
            return this.uploadFile(
                id, filePath, mimeType, "/assets", operation, apollo);
        } else if (operation.operationName === uploadAvatarOperationName) {
            const { id, filePath, mimeType } = operation.variables;
            return this.uploadFile(
                id, filePath, mimeType, "/avatars", operation, apollo);
        }

        return forward!(operation);
    }

    private uploadFile(
        id: string,
        filePath: string,
        mimeType: string,
        endpoint: string,
        operation: Operation,
        apollo: DataProxy,
    ) {
        return new Observable((observer) => {
            const body = new FormData();
            body.append("file", {
                name: "file",
                type: mimeType,
                uri: filePath,
            } as any);
            body.append("id", id);
            const { accessToken } = getSession(apollo);
            fetch(this.envConfig.serverUrl + endpoint, {
                body,
                headers: { Authorization: "Bearer " + accessToken },
                method: "POST",
            })
            .then((res) => {
                operation.setContext({ res });
                return res;
            })
            .then(parseAndCheckHttpResponse(operation))
            .then((responseData) => {
                observer.next(responseData);
                observer.complete();
                return responseData;
            })
            .catch((error) => {
                const { result } = error;

                if (result && result.errors && result.data) {
                    observer.next(result);
                }

                observer.error(error);
            });
        });
    }
}

export default UploadLink;

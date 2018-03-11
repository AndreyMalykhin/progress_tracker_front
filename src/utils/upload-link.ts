import { getSession } from "actions/session-helpers";
import { uploadAssetOperationName } from "actions/upload-asset-action";
import { uploadAvatarOperationName } from "actions/upload-avatar-action";
import { DataProxy } from "apollo-cache";
import { ApolloError } from "apollo-client";
import { ApolloLink, NextLink, Observable, Operation } from "apollo-link";
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
            const { filePath, mimeType } = operation.variables;
            return this.uploadFile(filePath, mimeType, "/assets", apollo);
        } else if (operation.operationName === uploadAvatarOperationName) {
            const { filePath, mimeType } = operation.variables;
            return this.uploadFile(filePath, mimeType, "/avatars", apollo);
        }

        return forward!(operation);
    }

    private uploadFile(
        filePath: string, mimeType: string, endpoint: string, apollo: DataProxy,
    ) {
        return new Observable((observer) => {
            const body = new FormData();
            body.append("file", {
                name: null,
                type: mimeType,
                uri: filePath,
            } as any);
            const { accessToken } = getSession(apollo);
            let response: Response;

            fetch(this.envConfig.serverUrl + endpoint, {
                body,
                headers: { Authorization: "Bearer " + accessToken },
                method: "POST",
            }).then((res) => {
                response = res;
                return response.json();
            })
            .then((responseData) => {
                if (!response.ok) {
                    const networkError: any =
                        new Error("Bad http status: " + response.status);
                    networkError.response = response;
                    observer.error(new ApolloError(
                        { networkError, graphQLErrors: responseData.errors }));
                    return;
                }

                observer.next(responseData);
                observer.complete();
            })
            .catch((networkError) => {
                networkError.response = response;
                observer.error(new ApolloError({ networkError }));
            });
        });
    }
}

export default UploadLink;

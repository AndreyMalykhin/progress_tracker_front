import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import { IEnvConfig } from "utils/env-config";
import makeLog from "utils/make-log";

interface IUploadFileResponse {
    payload: {
        id: string;
    };
    status: number;
}

const log = makeLog("upload-file");

async function uploadFile(
    filePath: string,
    mimeType: string,
    endpointUrl: string,
    apollo: DataProxy,
    envConfig: IEnvConfig,
) {
    const body = new FormData();
    body.append("file", {
        name: null,
        type: mimeType,
        uri: filePath,
    } as any);
    const accessToken = getSession(apollo).accessToken;

    try {
        const response = await fetch(envConfig.serverUrl + endpointUrl, {
            body,
            headers: { Authorization: "Bearer " + accessToken },
            method: "POST",
        });
        const json = (await response.json()) as IUploadFileResponse;

        if (json.status !== 200) {
            log.error("uploadFile(); bad response=%o", response);
        }

        return json;
    } catch (e) {
        log.error("uploadFile(); error=%o", e);
        throw e;
    }
}

export default uploadFile;

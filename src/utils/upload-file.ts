import { getSession } from "actions/session-helpers";
import { DataProxy } from "apollo-cache";
import Config from "utils/config";
import makeLog from "./make-log";

interface IUploadFileResponse {
    payload: {
        id: string;
    };
    status: number;
}

const log = makeLog("upload-file");

async function uploadFile(
    filePath: string, mimeType: string, endpointUrl: string, apollo: DataProxy,
) {
    const body = new FormData();
    body.append("file", {
        name: null,
        type: mimeType,
        uri: filePath,
    } as any);
    const accessToken = getSession(apollo).accessToken;

    try {
        const response = await fetch(Config.serverUrl + endpointUrl, {
            body,
            headers: { Authorization: "Bearer " + accessToken },
            method: "POST",
        });
        return (await response.json()) as IUploadFileResponse;
    } catch (e) {
        log.error("uploadFile(); error=%o", e);
        throw e;
    }
}

export default uploadFile;

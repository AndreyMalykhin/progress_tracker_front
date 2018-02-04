async function uploadFile(
    filePath: string, mimeType: string, endpointUrl: string,
) {
    const body = new FormData();
    body.append("file", {
        name: null,
        type: mimeType,
        uri: filePath,
    } as any);
    const response = await fetch(process.env.SERVER_URL + endpointUrl, {
        body,
        headers: { Authorization: "Bearer TODO" },
        method: "POST",
    });
    return response.json();
}

export default uploadFile;

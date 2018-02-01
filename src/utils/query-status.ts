enum QueryStatus {
    InitialLoading = 1,
    SetVariables = 2,
    LoadingMore = 3,
    Reloading = 4,
    Polling = 6,
    Ready = 7,
    Error = 8,
}

function isLoading(queryStatus: QueryStatus) {
    return queryStatus < QueryStatus.Ready;
}

export { isLoading };
export default QueryStatus;

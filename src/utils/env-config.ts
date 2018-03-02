type IEnvConfig = typeof config;

const config = {
    cacheRefreshPeriod: Number(process.env.CACHE_REFRESH_PERIOD),
    deadlineWatchPeriod: Number(process.env.DEADLINE_WATCH_PERIOD),
    isDevEnv: process.env.NODE_ENV === "development",
    pingPeriod: Number(process.env.PING_PERIOD),
    serverUrl: process.env.SERVER_URL as string,
    syncRetryTimeout: Number(process.env.SYNC_RETRY_TIMEOUT),
};

function makeEnvConfig() {
    return config;
}

export { IEnvConfig, makeEnvConfig };

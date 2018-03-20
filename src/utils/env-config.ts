type IEnvConfig = typeof config;

const config = {
    cacheRefreshPeriod: Number(process.env.CACHE_REFRESH_PERIOD),
    deadlineWatchPeriod: Number(process.env.DEADLINE_WATCH_PERIOD),
    env: process.env.NODE_ENV,
    isDevEnv: process.env.NODE_ENV === "development",
    pingPeriod: Number(process.env.PING_PERIOD),
    sentryDsn: process.env.SENTRY_DSN,
    serverUrl: process.env.SERVER_URL as string,
    syncRetryTimeout: Number(process.env.SYNC_RETRY_TIMEOUT),
};

function makeEnvConfig() {
    return config;
}

export { IEnvConfig, makeEnvConfig };

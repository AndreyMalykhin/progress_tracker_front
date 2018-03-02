import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import Type from "models/type";
import { InteractionManager, NetInfo, Platform } from "react-native";
import dataIdFromObject from "utils/data-id-from-object";
import defaultId from "utils/default-id";
import { IEnvConfig } from "utils/env-config";
import makeLog from "utils/make-log";

interface IGetOfflineStatusResponse {
    offline: {
        isOnline?: boolean;
    };
}

const log = makeLog("network-tracker");

const getOfflineStatusQuery = gql`
query GetOfflineStatus {
    offline @client {
        isOnline
    }
}`;

const offlineFragment = gql`
fragment NetworkTrackerOfflineFragment on Offline {
    isOnline
}`;

const offlineFragmentId =
    dataIdFromObject({ __typename: Type.Offline, id: defaultId })!;

class NetworkTracker {
    private apollo: ApolloClient<NormalizedCacheObject>;
    private isOnline?: boolean;
    private isPinging = false;
    private envConfig: IEnvConfig;

    public constructor(
        apollo: ApolloClient<NormalizedCacheObject>, envConfig: IEnvConfig,
    ) {
        this.apollo = apollo;
        this.envConfig = envConfig;
    }

    public async start() {
        this.isOnline = false;

        try {
            this.isOnline = await isConnected();
        } catch (e) {
            log.trace("start(); error=%o", e);
        }

        this.ensureCorrectStatusInStore();
        setInterval(this.ping, this.envConfig.pingPeriod);
        /* NetInfo.isConnected.addEventListener(
            "connectionChange", this.onConnectionChange); */
    }

    /* private onConnectionChange = (isOnline: boolean) => {
        if (this.isOnline === isOnline) {
            return;
        }

        this.isOnline = isOnline;
        this.saveStatus();
    } */

    private ensureCorrectStatusInStore() {
        this.apollo.watchQuery<IGetOfflineStatusResponse>({
            fetchPolicy: "cache-only", query: getOfflineStatusQuery,
        }).subscribe((result) => {
            if (result.data.offline.isOnline == null) {
                this.saveStatus();
            }
        });
    }

    private saveStatus() {
        InteractionManager.runAfterInteractions(() => {
            log.trace("saveStatus(); isOnline=%o", this.isOnline);
            this.apollo.writeFragment({
                data: { __typename: Type.Offline, isOnline: this.isOnline },
                fragment: offlineFragment,
                id: offlineFragmentId,
            });
        });
    }

    private ping = async () => {
        if (this.isPinging) {
            return;
        }

        this.isPinging = true;
        const isOnline = await ping();

        if (this.isOnline !== isOnline) {
            this.isOnline = isOnline;
            this.saveStatus();
        }

        this.isPinging = false;
    }
}

function isConnected(): Promise<boolean> {
    if (Platform.OS === "ios") {
        return new Promise((resolve) => {
            const onConnectionChange = (isOnline: boolean) => {
                NetInfo.isConnected.removeEventListener(
                    "connectionChange", onConnectionChange );
                resolve(isOnline);
            };
            NetInfo.isConnected.addEventListener(
                "connectionChange", onConnectionChange);
        });
    }

    return NetInfo.isConnected.fetch();
}

async function ping() {
    try {
        const response = await fetch(
            "https://google.com", { method: "HEAD", cache: "no-cache" });
        log.trace("ping(); status=%o", response.status);
        return true;
    } catch (e) {
        log.trace("ping(); error=%o", e.message);
        return false;
    }
}

export default NetworkTracker;

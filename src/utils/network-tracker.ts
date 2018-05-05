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
    private isOnline = true;
    private isPinging = false;
    private envConfig: IEnvConfig;
    private intervalId?: NodeJS.Timer | number;

    public constructor(
        apollo: ApolloClient<NormalizedCacheObject>, envConfig: IEnvConfig,
    ) {
        this.apollo = apollo;
        this.envConfig = envConfig;
    }

    public async start() {
        await this.ping();
        this.ensureCorrectStatusInStore();
    }

    public get online() {
        return this.isOnline;
    }

    public set online(isOnline: boolean) {
        if (this.isOnline === isOnline) {
            return;
        }

        this.isOnline = isOnline;
        this.saveStatus();

        if (isOnline) {
            this.stopPinging();
        } else {
            this.startPinging();
        }
    }

    private startPinging() {
        this.intervalId = setInterval(this.ping, this.envConfig.pingPeriod);
    }

    private stopPinging() {
        clearInterval(this.intervalId! as number);
    }

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
        log.trace("saveStatus", "isOnline=%o", this.isOnline);
        this.apollo.writeFragment({
            data: { __typename: Type.Offline, isOnline: this.isOnline },
            fragment: offlineFragment,
            id: offlineFragmentId,
        });
    }

    private ping = async () => {
        if (this.isPinging) {
            return;
        }

        this.isPinging = true;
        this.online = await this.doPing();
        this.isPinging = false;
    }

    private async doPing() {
        try {
            const response = await fetch(this.envConfig.serverUrl,
                { method: "HEAD", cache: "no-cache" });
            log.trace("doPing", "status=%o", response.status);
            return true;
        } catch (e) {
            log.trace("doPing", "error=%o", e.message);
            return false;
        }
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

export default NetworkTracker;

import {
    ISpliceActivitiesFragment,
    spliceActivities,
} from "actions/activity-helpers";
import { DataProxy } from "apollo-cache";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import gql from "graphql-tag";
import Audience from "models/audience";
import Type from "models/type";
import { MutationFunc } from "react-apollo";
import makeLog from "utils/make-log";

interface ISetUserMutedResponse {
    setUserMuted: {
        user: {
            id: string;
            isMuted: boolean;
        };
    };
}

interface IGetFriendsActivitiesResponse {
    getActivitiesByAudience: {
        edges: Array<{
            node: {
                id: string;
                user: {
                    id: string;
                }
            };
        }>;
    };
}

interface IGetMutedActivitiesResponse {
    getMutedActivities: Array<{
        __typename: Type;
        id: string;
        date: number;
    }>;
}

const log = makeLog("set-user-muted-action");

const setUserMutedQuery = gql`
mutation SetUserMuted($id: ID!, $isMuted: Boolean!) {
    setUserMuted(id: $id, isMuted: $isMuted) {
        user {
            id
            isMuted
        }
    }
}`;

const getMutedActivitiesQuery = gql`
query GetMutedActivities($userId: ID!) {
    getMutedActivities(userId: $userId) @client {
        id
        date
    }
}`;

const getFriendsActivitiesQuery = gql`
query GetFriendsActivities($audience: Audience!) {
    getActivitiesByAudience(audience: $audience) @connection(
        key: "getActivitiesByAudience", filter: ["audience"]
    ) {
        edges {
            node {
                id
                date
                user {
                    id
                }
            }
        }
    }
}`;

async function setUserMuted(
    id: string,
    isMuted: boolean,
    mutate: MutationFunc<ISetUserMutedResponse>,
    apollo: ApolloClient<NormalizedCacheObject>,
) {
    await mutate({
        optimisticResponse: getOptimisticResponse(id, isMuted),
        update: (proxy, response) => {
            updateActivities(response.data as ISetUserMutedResponse, proxy);
        },
        variables: { id, isMuted },
    });
}

function updateActivities(response: ISetUserMutedResponse, apollo: DataProxy) {
    const userId = response.setUserMuted.user.id;
    const mutedActivities = [];
    let activityIdsToRemove: string[] = [];
    let activitiesToAdd: ISpliceActivitiesFragment[] = [];

    if (response.setUserMuted.user.isMuted) {
        let friendsActivitiesResponse;

        try {
            friendsActivitiesResponse =
                apollo.readQuery<IGetFriendsActivitiesResponse>({
                    query: getFriendsActivitiesQuery,
                    variables: { audience: Audience.Friends },
                });
        } catch (e) {
            log("updateActivities(); no friends activities");
            return;
        }

        if (!friendsActivitiesResponse) {
            return;
        }

        const friendsActivities =
            friendsActivitiesResponse.getActivitiesByAudience.edges;

        for (const activity of friendsActivities) {
            if (activity.node.user.id === userId) {
                mutedActivities.push(activity.node);
            }
        }

        activityIdsToRemove =
            mutedActivities.map((activity) => activity.id);
    } else {
        let mutedActivitiesResponse;

        try {
            mutedActivitiesResponse =
                apollo.readQuery<IGetMutedActivitiesResponse>({
                    query: getMutedActivitiesQuery,
                    variables: { userId },
                });
        } catch (e) {
            log("updateActivities(); no muted activities");
            return;
        }

        if (!mutedActivitiesResponse) {
            return;
        }

        activitiesToAdd = mutedActivitiesResponse.getMutedActivities;
    }

    spliceActivities(
        activityIdsToRemove, activitiesToAdd, Audience.Friends, apollo);
    apollo.writeQuery({
        data: {
            __typename: Type.Query,
            getMutedActivities: mutedActivities,
        },
        query: getMutedActivitiesQuery,
        variables: { userId },
    });
}

function getOptimisticResponse(id: string, isMuted: boolean) {
    return {
        __typename: Type.Mutation,
        setUserMuted: {
            __typename: Type.SetUserMutedResponse,
            user: {
                __typename: Type.User, id, isMuted,
            },
        },
    };
}

export { setUserMuted, ISetUserMutedResponse, setUserMutedQuery };

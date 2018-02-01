import myId from "utils/my-id";

export default {
    activities: {
        exact: false,
        path: "/activities",
    },
    activitiesFriends: {
        exact: true,
        path: "/activities/friends",
    },
    activitiesGlobal: {
        exact: true,
        path: "/activities/all",
    },
    friends: {
        exact: true,
        path: "/friends",
    },
    leaders: {
        exact: false,
        path: "/leaders",
    },
    leadersGlobal: {
        exact: true,
        path: "/leaders/all",
    },
    profile: {
        exact: false,
        path: "/profile/:id",
    },
    profileActiveTrackables: {
        exact: true,
        path: "/profile/:id/in-progress",
    },
    profileArchive: {
        exact: true,
        path: "/profile/:id/archive",
    },
    profileEdit: {
        exact: true,
        path: `/profile/${myId}/edit`,
    },
    profileMyActiveTrackables: {
        exact: true,
        path: `/profile/${myId}/in-progress`,
    },
    profileMyArchive: {
        exact: true,
        path: `/profile/${myId}/archive`,
    },
    reviews: {
        exact: false,
        path: "/reviews",
    },
    reviewsGlobal: {
        exact: true,
        path: "/reviews/global",
    },
    trackableEdit: {
        exact: true,
        path: "/goal/:id/edit",
    },
    trackableNew: {
        exact: true,
        path: "/goal/new/:type",
    },
};

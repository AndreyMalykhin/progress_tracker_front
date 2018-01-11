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
    profileMyActiveTrackables: {
        exact: true,
        path: "/profile/me/in-progress",
    },
    profileMyArchive: {
        exact: true,
        path: "/profile/me/archive",
    },
    reviews: {
        exact: false,
        path: "/reviews",
    },
    reviewsGlobal: {
        exact: true,
        path: "/reviews/global",
    },
    trackableNew: {
        exact: true,
        path: "/goal/new/:type",
    },
};

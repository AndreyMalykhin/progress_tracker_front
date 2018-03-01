export default {
    activities: {
        exact: true,
        path: "/activities/:audience",
    },
    friends: {
        exact: true,
        path: "/friends",
    },
    index: {
        exact: true,
        path: "/",
    },
    leaders: {
        exact: true,
        path: "/leaders/:audience",
    },
    pendingReview: {
        exact: true,
        path: "/pending-review/:audience",
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
        path: "/profile/:id/archive/:trackableStatus",
    },
    profileEdit: {
        exact: true,
        path: `/profile/edit`,
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

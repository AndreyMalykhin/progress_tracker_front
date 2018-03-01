import defaultId from "utils/default-id";

interface ISessionFragment {
    userId?: string;
}

function isMyId(id: string|undefined, session: ISessionFragment) {
    return !id || id === defaultId || id === session.userId;
}

export default isMyId;

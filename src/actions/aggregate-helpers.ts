import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import dataIdFromObject from "utils/data-id-from-object";

interface IUpdateAggregateFragment {
    __typename: Type;
    id: string;
    progress: number;
    maxProgress: number | null;
    children: Array<{
        __typename: Type;
        status: TrackableStatus;
        id: string;
        progress: number;
        maxProgress: number | null;
        parent: { id: string; } | null;
    }>;
}

interface IUnaggregateChildrenFragment {
    children: Array<{ parent: object | null }>;
}

interface IGetProgressFragment {
    __typename: Type;
    id: string;
    progress: number;
    maxProgress: number | null;
}

const updateAggregateFragment = gql`
fragment UpdateAggregateFragment on Aggregate {
    id
    progress
    maxProgress
    children {
        id
        status
        ... on IAggregatable {
            parent {
                id
            }
        }
        ... on Counter {
            progress
        }
        ... on IGoal {
            progress
            maxProgress
        }
    }
}`;

/**
 * @returns False if aggregate is removed
 */
function removeChild(aggregate: IUpdateAggregateFragment, id: string) {
    const { children } = aggregate;

    for (let i = 0; i < children.length; ++i) {
        if (children[i].id === id) {
            children.splice(i, 1);
            break;
        }
    }

    return updateAggregate(aggregate);
}

function setChildProgress(
    aggregate: IUpdateAggregateFragment,
    childId: string,
    progress: number,
) {
    for (const currentChild of aggregate.children) {
        if (currentChild.id === childId) {
            currentChild.progress = progress;
        }
    }

    updateAggregate(aggregate);
}

function getProgress(children: IGetProgressFragment[]) {
    let current = 0;
    let max: number | null = null;

    if (children[0].__typename === Type.Counter) {
        for (const child of children) {
            current += child.progress;
        }
    } else {
        const childrenCount = children.length;
        max = 1;

        for (const child of children) {
            const childNormalizedProgress =
                child.progress / child.maxProgress!;
            current += childNormalizedProgress / childrenCount;
        }
    }

    return { current, max };
}

/**
 * @returns False if aggregate is removed
 */
function setChildStatus(
    aggregate: IUpdateAggregateFragment,
    childId: string,
    status: TrackableStatus,
) {
    for (const currentChild of aggregate.children) {
        if (currentChild.id === childId) {
            currentChild.status = status;
            break;
        }
    }

    return updateAggregate(aggregate);
}

/**
 * @returns False if aggregate is removed
 */
function updateAggregate(aggregate: IUpdateAggregateFragment) {
    let hasActiveChildren = false;
    const { children } = aggregate;

    if (children.length) {
        for (const child of children) {
            if (
                child.status === TrackableStatus.Active ||
                child.status === TrackableStatus.PendingProof
            ) {
                hasActiveChildren = true;
                break;
            }
        }

        if (hasActiveChildren) {
            const { current, max } = getProgress(children);
            aggregate.progress = current;
            aggregate.maxProgress = max;
            return true;
        } else {
            unaggregateChildren(aggregate);
            return false;
        }
    } else {
        unaggregateChildren(aggregate);
        return false;
    }
}

function unaggregateChildren(aggregate: IUnaggregateChildrenFragment) {
    for (const child of aggregate.children) {
        child.parent = null;
    }

    aggregate.children = [];
}

export {
    setChildStatus,
    setChildProgress,
    getProgress,
    removeChild,
    updateAggregateFragment,
    IUpdateAggregateFragment,
};

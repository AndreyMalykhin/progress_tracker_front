import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import TrackableStatus from "models/trackable-status";
import Type from "models/type";
import dataIdFromObject from "utils/data-id-from-object";

interface ISetChildStatusChildFragment {
    id: string;
    status: TrackableStatus;
    parent: { id: string; } | null;
}

interface ISetChildStatusAggregateFragment {
    id: string;
    children: ISetChildStatusChildFragment[];
}

interface IUpdateProgressAggregateFragment {
    id: string;
    progress: number;
    maxProgress?: number;
    children: Array<{
        __typename: Type;
        id: string;
        progress: number;
        maxProgress?: number;
    }>;
}

interface IUpdateProgressChildFragment {
    id: string;
    progress: number;
}

type IRemoveChildFragment = IUpdateProgressAggregateFragment;

interface IGetProgressFragment {
    __typename: Type;
    id: string;
    progress: number;
    maxProgress?: number;
}

const setChildStatusFragment = gql`
fragment SetChildStatusAggregateFragment on Aggregate {
    id
    children {
        id
        status
        parent {
            id
        }
    }
}`;

const updateProgressFragment = gql`
fragment UpdateProgressAggregateFragment on Aggregate {
    id
    progress
    maxProgress
    children {
        id
        ... on Counter {
            progress
        }
        ... on IGoal {
            progress
            maxProgress
        }
    }
}`;

const removeChildFragment = gql`
fragment RemoveChildAggregateFragment on Aggregate {
    id
    progress
    maxProgress
    children {
        id
        ... on Counter {
            progress
        }
        ... on IGoal {
            progress
            maxProgress
        }
    }
}`;

function removeChild(id: string, parent: IRemoveChildFragment) {
    const { children } = parent;

    for (let i = 0; i < children.length; ++i) {
        if (children[i].id === id) {
            children.splice(i, 1);
            break;
        }
    }

    if (children.length) {
        const { current, max } = getProgress(children);
        parent.progress = current;
        parent.maxProgress = max;
        return false;
    }

    return true;
}

function updateProgress(
    aggregate: IUpdateProgressAggregateFragment,
    childToUpdate?: IUpdateProgressChildFragment,
) {
    if (childToUpdate) {
        for (const child of aggregate.children) {
            if (child.id === childToUpdate.id) {
                child.progress = childToUpdate.progress;
            }
        }
    }

    const { current, max } = getProgress(aggregate.children);
    aggregate.progress = current;
    aggregate.maxProgress = max;
}

function getProgress(aggregateChildren: IGetProgressFragment[]) {
    let current = 0;
    let max;

    if (aggregateChildren[0].__typename === Type.Counter) {
        for (const child of aggregateChildren) {
            current += child.progress;
        }
    } else {
        const childrenCount = aggregateChildren.length;
        max = 1;

        for (const child of aggregateChildren) {
            const childNormalizedProgress =
                child.progress / child.maxProgress!;
            current += childNormalizedProgress / childrenCount;
        }
    }

    return { current, max };
}

function setChildStatus(
    aggregate: ISetChildStatusAggregateFragment,
    child: ISetChildStatusChildFragment,
    status: TrackableStatus,
) {
    let hasActiveChildren = false;

    for (const currentChild of aggregate.children) {
        if (child.id === currentChild.id) {
            child.status = currentChild.status = status;
        }

        if (currentChild.status === TrackableStatus.Active
            || currentChild.status === TrackableStatus.PendingProof
        ) {
            hasActiveChildren = true;
        }
    }

    if (!hasActiveChildren) {
        for (const currentChild of aggregate.children) {
            currentChild.parent = null;
        }
    }

    return hasActiveChildren;
}

export {
    setChildStatus,
    setChildStatusFragment,
    ISetChildStatusAggregateFragment,
    updateProgress,
    updateProgressFragment,
    IUpdateProgressAggregateFragment,
    getProgress,
    removeChild,
    removeChildFragment,
    IRemoveChildFragment,
};

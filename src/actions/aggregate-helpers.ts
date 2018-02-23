import { DataProxy } from "apollo-cache";
import gql from "graphql-tag";
import Type from "models/type";
import dataIdFromObject from "utils/data-id-from-object";

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
        ... on TaskGoal {
            progress
            maxProgress
        }
        ... on NumericalGoal {
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
        ... on TaskGoal {
            progress
            maxProgress
        }
        ... on NumericalGoal {
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
    childToUpdate: IUpdateProgressChildFragment,
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

export {
    updateProgress,
    updateProgressFragment,
    IUpdateProgressAggregateFragment,
    getProgress,
    removeChild,
    removeChildFragment,
    IRemoveChildFragment,
};

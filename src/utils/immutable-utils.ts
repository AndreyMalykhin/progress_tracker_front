function removeIndex(index: number, array: any[]) {
    const output = [];

    for (let i = 0; i < array.length; ++i) {
        if (index !== i) {
            output.push(array[i]);
        }
    }

    return output;
}

function push<T>(item: T, array: T[]) {
    return array.concat(item);
}

function pop<T>(array: T[]) {
    return array.slice(0, -1);
}

export { removeIndex, push, pop };

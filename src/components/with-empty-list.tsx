import * as React from "react";

function withEmptyList<T>(
    emptyList: React.ComponentType, getList: (props: T) => any[],
) {
    return (Component: React.ComponentType<T>) => {
        return class WithEmptyList extends React.Component<T> {
            public render() {
                return getList(this.props).length ?
                    <Component {...this.props} /> :
                    React.createElement(emptyList);
            }
        };
    };
}

export default withEmptyList;

import * as React from "react";

function withEmptyList<T>(
    emptyList: React.ComponentClass, getList: (props: T) => any[],
) {
    return (Component: React.ComponentClass<T>) => {
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

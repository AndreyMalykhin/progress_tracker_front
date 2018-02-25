import * as React from "react";

function withEmptyList<T>(
    emptyList: React.ComponentType, getList: (props: T) => any[],
) {
    return (component: React.ComponentType<T>) => {
        class WithEmptyList extends React.Component<T> {
            public render() {
                const Component =
                    getList(this.props).length ? component : emptyList;
                return <Component {...this.props} />;
            }
        }

        return WithEmptyList;
    };
}

export default withEmptyList;

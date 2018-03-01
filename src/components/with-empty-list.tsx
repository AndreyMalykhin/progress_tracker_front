import * as React from "react";

function withEmptyList<P>(
    emptyList: React.ComponentType, getList: (props: P) => any[],
) {
    return (component: React.ComponentType<P>) => {
        class WithEmptyList extends React.Component<P> {
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

import * as React from "react";
import { IConnection } from "utils/connection";

function withEmptyList<P>(
    emptyList: React.ComponentType,
    getList: (props: P) => IConnection<any, any>,
) {
    return (component: React.ComponentType<P>) => {
        class WithEmptyList extends React.Component<P> {
            public render() {
                const connection = getList(this.props);
                const Component = connection && connection.edges.length ?
                    component : emptyList;
                return <Component {...this.props} />;
            }
        }

        return WithEmptyList;
    };
}

export default withEmptyList;

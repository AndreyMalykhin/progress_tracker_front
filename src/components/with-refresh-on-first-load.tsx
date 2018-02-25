import { FetchPolicy } from "apollo-client/core/watchQueryOptions";
import * as React from "react";
import uuid from "utils/uuid";

interface IWithRefreshOnFirstLoadProps {
    fetchPolicy: FetchPolicy;
}

function withRefreshOnFirstLoad<P>(getFilter?: (props: P) => string) {
    return (
        Component: React.ComponentType<P & IWithRefreshOnFirstLoadProps>,
    ) => {
        const isNotFirstLoad: { [key: string]: boolean } = {};
        let filter = uuid();

        class WithRefetchOnFirstLoad extends React.Component<P> {
            public render() {
                const fetchPolicy = isNotFirstLoad[filter] ? "cache-first" :
                    "cache-and-network";
                return <Component fetchPolicy={fetchPolicy} {...this.props} />;
            }

            public componentWillMount() {
                if (getFilter) {
                    filter = getFilter(this.props);
                }
            }

            public componentDidMount() {
                isNotFirstLoad[filter] = true;
            }
        }

        return WithRefetchOnFirstLoad;
    };
}

export { IWithRefreshOnFirstLoadProps };
export default withRefreshOnFirstLoad;

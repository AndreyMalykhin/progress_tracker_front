import { FetchPolicy } from "apollo-client/core/watchQueryOptions";
import * as React from "react";
import makeLog from "utils/make-log";
import uuid from "utils/uuid";

interface IWithRefreshOnFirstLoadProps {
    fetchPolicy: FetchPolicy;
}

const log = makeLog("with-refresh-on-first-load");

function withRefreshOnFirstLoad<P>(getFilter?: (props: P) => string) {
    return (
        Component: React.ComponentType<P & IWithRefreshOnFirstLoadProps>,
    ) => {
        const isNotFirstLoad: { [key: string]: boolean } = {};
        let filter = uuid();

        class WithRefetchOnFirstLoad extends React.Component<P> {
            public render() {
                let fetchPolicy: FetchPolicy = "cache-first";

                if (!isNotFirstLoad[filter]) {
                    fetchPolicy = "cache-and-network";
                    log.trace("render(); fetchPolicy=%o", fetchPolicy);
                }

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

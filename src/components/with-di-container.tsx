import { IDIContainerProviderContext } from "components/di-container-provider";
import * as PropTypes from "prop-types";
import * as React from "react";
import DIContainer from "utils/di-container";

interface IWithDIContainerProps {
    diContainer: DIContainer;
}

function withDIContainer<P>(
    Component: React.ComponentType<P & IWithDIContainerProps>,
) {
    class WithDIContainer extends React.Component<P> {
        public static contextTypes = {
            diContainer: PropTypes.instanceOf(DIContainer).isRequired,
        };

        public render() {
            return (
                <Component
                    diContainer={this.context.diContainer}
                    {...this.props}
                />
            );
        }
    }

    return WithDIContainer;
}

export { IWithDIContainerProps };
export default withDIContainer;

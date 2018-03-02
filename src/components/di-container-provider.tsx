import * as PropTypes from "prop-types";
import * as React from "react";
import DIContainer from "utils/di-container";

interface IDIContainerProviderProps {
    container: DIContainer;
}

interface IDIContainerProviderContext {
    diContainer: DIContainer;
}

class DIContainerProvider extends React.Component<IDIContainerProviderProps> {
    public static childContextTypes = {
        diContainer: PropTypes.instanceOf(DIContainer).isRequired,
    };
    private childContext: IDIContainerProviderContext =
        { diContainer: this.props.container };

    public render() {
        return this.props.children;
    }

    public getChildContext(): IDIContainerProviderContext {
        return this.childContext;
    }
}

export { IDIContainerProviderContext };
export default DIContainerProvider;

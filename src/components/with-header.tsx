import { IHeaderHistoryState, IHeaderShape } from "components/header";
import * as React from "react";
import { RouteComponentProps } from "react-router";

interface IWithHeaderProps {
    header: {
        push: (shape: IHeaderShape) => void;
        replace: (shape: IHeaderShape|null) => void;
        pop: () => void;
        isEmpty(): boolean;
    };
}

function withHeader<T extends IWithHeaderProps>(
    Component: React.ComponentType<T>,
) {
    class WithHeader extends
        React.Component< T & RouteComponentProps<{}> > {
        public render() {
            return <Component header={this} {...this.props} />;
        }

        public isEmpty() {
            const locationState = this.props.location.state;
            return !locationState || !locationState.header;
        }

        public replace(shape: IHeaderShape|null) {
            const { history, location } = this.props;
            const historyState: IHeaderHistoryState = {
                ...location.state, header: shape,
            };
            history.replace({ ...location as object, state: historyState });
        }

        public push(shape: IHeaderShape) {
            const { history, location } = this.props;
            const historyState: IHeaderHistoryState = {
                ...location.state, header: shape,
            };
            history.push({ ...location as object, state: historyState });
        }

        public pop() {
            this.props.history.goBack();
        }
    }

    return WithHeader;
}

export { IWithHeaderProps };
export default withHeader;

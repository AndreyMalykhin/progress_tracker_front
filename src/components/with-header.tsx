import { IHeaderState } from "components/header";
import * as React from "react";
import { RouteComponentProps } from "react-router";

interface IWithHeaderProps {
    header: {
        push: (state: IHeaderState) => void;
        replace: (state: IHeaderState|null) => void;
        pop: () => void;
        isEmpty(): boolean;
    };
}

function withHeader<T extends IWithHeaderProps>(
    Component: React.ComponentType<T>,
) {
    return class WithHeader extends
        React.Component< T & RouteComponentProps<{}> > {
        public render() {
            return <Component header={this} {...this.props} />;
        }

        public isEmpty() {
            const locationState = this.props.location.state;
            return !locationState || !locationState.header;
        }

        public replace(state: IHeaderState|null) {
            const { history, location } = this.props;
            history.replace({
                ...location as object,
                state: { ...location.state, header: state },
            });
        }

        public push(state: IHeaderState) {
            const { history, location } = this.props;
            history.push({
                ...location as object,
                state: { ...location.state, header: state },
            });
        }

        public pop() {
            this.props.history.goBack();
        }
    };
}

export { IWithHeaderProps };
export default withHeader;

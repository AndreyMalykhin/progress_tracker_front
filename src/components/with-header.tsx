import { IHeaderState } from "components/header";
import * as React from "react";
import { RouteComponentProps } from "react-router";

interface IWithHeaderProps {
    header: {
        push: (state: IHeaderState) => void;
        replace: (state: IHeaderState|null) => void;
        pop: () => void;
    };
}

function withHeader<T extends IWithHeaderProps>(
    Component: React.ComponentClass<T>,
) {
    // tslint:disable-next-line:max-classes-per-file
    return class WithHeader extends
        React.Component< T & RouteComponentProps<{}> > {
        public render() {
            return <Component header={this} {...this.props} />;
        }

        public replace(state: IHeaderState|null) {
            this.props.history.replace(
                Object.assign({}, this.props.location, { state } ));
        }

        public push(state: IHeaderState) {
            this.props.history.push(
                Object.assign({}, this.props.location, { state } ));
        }

        public pop() {
            this.props.history.goBack();
        }
    };
}

export { IWithHeaderProps };
export default withHeader;

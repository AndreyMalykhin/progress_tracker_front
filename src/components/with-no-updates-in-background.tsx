import { IStackingSwitchContext } from "components/stacking-switch";
import * as PropTypes from "prop-types";
import * as React from "react";
import makeLog from "utils/make-log";

const log = makeLog("with-no-updates-in-background");

function withNoUpdatesInBackground<P>(Component: React.ComponentType<P>) {
    class WithNoUpdatesInBackground extends React.Component<P> {
        public static contextTypes = {
            isInBackground: PropTypes.func.isRequired,
        };

        public render() {
            return <Component {...this.props} />;
        }

        public shouldComponentUpdate() {
            return !(this.context as IStackingSwitchContext).isInBackground();
        }
    }

    return WithNoUpdatesInBackground;
}

export default withNoUpdatesInBackground;

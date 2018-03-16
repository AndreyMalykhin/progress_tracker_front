import TabBar, { ITabBarProps } from "components/tab-bar";
import * as React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { matchPath, RouteComponentProps, withRouter } from "react-router";
import { IMultiStackHistoryState } from "utils/multi-stack-history";

type INavBarItemRenderer = (
    path: string,
    isActive: boolean,
    onSelect: (path: string) => void,
    titleMsgId?: string,
    iconName?: string,
    isDisabled?: boolean,
) => React.ReactNode;

interface INavBarProps extends RouteComponentProps<{}> {
    isDisabled?: boolean;
    items: INavBarItem[];
    resetHistory?: boolean;
    renderItem: INavBarItemRenderer;
    style?: StyleProp<ViewStyle>;
}

interface INavBarItem {
    matchExact: boolean;
    matchPath: string;
    navigateToPath: string;
    titleMsgId?: string;
    iconName?: string;
}

class NavBar extends React.PureComponent<INavBarProps> {
    public render() {
        const { location, renderItem, style, items, isDisabled } = this.props;
        const tabs = items.map((item) => {
            const {
                matchPath: pathToMatch,
                navigateToPath,
                matchExact,
                titleMsgId,
                iconName,
            } = item;
            const match = matchPath(location.pathname,
                { path: pathToMatch, exact: matchExact });
            const isActive = match != null;
            return renderItem(
                navigateToPath,
                isActive,
                this.onSelect,
                titleMsgId,
                iconName,
                isDisabled,
            );
        });
        return <TabBar style={style}>{tabs}</TabBar>;
    }

    private onSelect = (path: string) => {
        const { history, location, resetHistory } = this.props;
        let newLocation;

        if (resetHistory) {
            const state: IMultiStackHistoryState = {
                multiStackHistory: { reset: true },
            };
            newLocation = { pathname: path, state };
        } else {
            newLocation = { ...location, pathname: path };
        }

        history.replace(newLocation);
    }
}

export { INavBarProps, INavBarItem, INavBarItemRenderer };
export default withRouter(NavBar);

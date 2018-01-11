import TabBar, { ITabBarProps } from "components/tab-bar";
import * as React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { matchPath, RouteComponentProps, withRouter } from "react-router";

type INavBarItemRenderer = (
    path: string,
    isActive: boolean,
    title?: string,
    icon?: string,
) => JSX.Element;

interface INavBarProps extends RouteComponentProps<{}> {
    items: INavBarItem[];
    keepState: boolean;
    renderItem: INavBarItemRenderer;
    style?: StyleProp<ViewStyle>;
}

interface INavBarItem {
    matchExact: boolean;
    matchPath: string;
    navigateToPath: string;
    title?: string;
    icon?: string;
}

class NavBar extends React.PureComponent<INavBarProps> {
    public render() {
        const { location, renderItem, style } = this.props;
        const tabs = this.props.items.map((item) => {
            const {
                matchPath: pathToMatch,
                navigateToPath,
                matchExact,
                title,
                icon,
            } = item;
            const match = matchPath(location.pathname,
                { path: pathToMatch, exact: matchExact });
            const isActive = match != null;
            return renderItem(navigateToPath, isActive, title, icon);
        });
        return <TabBar onSelect={this.onSelect} style={style}>{tabs}</TabBar>;
    }

    private onSelect = (path: string) => {
        const { history, location, keepState } = this.props;
        const newLocation =
            keepState ? { ...location, pathname: path } : { pathname: path };
        history.replace(newLocation);
    }
}

export { INavBarProps, INavBarItem, INavBarItemRenderer };
export default withRouter(NavBar);

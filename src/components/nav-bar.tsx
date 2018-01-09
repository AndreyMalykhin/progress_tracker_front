import TabBar from "components/tab-bar";
import * as React from "react";
import { matchPath, RouteComponentProps, withRouter } from "react-router";

type INavBarItemRenderer = (
    path: string,
    isActive: boolean,
    title?: string,
    icon?: string,
) => JSX.Element;

interface INavBarProps extends RouteComponentProps<{}> {
    items: INavBarItem[];
    renderItem: INavBarItemRenderer;
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
        const tabs = this.props.items.map((item) => {
            const {
                matchPath: pathToMatch,
                navigateToPath,
                matchExact,
                title,
                icon,
            } = item;
            const match = matchPath(this.props.location.pathname,
                { path: pathToMatch, exact: matchExact });
            const isActive = match != null;
            return this.props.renderItem(navigateToPath, isActive, title, icon);
        });
        return <TabBar onSelect={this.onSelect}>{tabs}</TabBar>;
    }

    private onSelect = (path: string) => this.props.history.replace(path);
}

export { INavBarProps, INavBarItem, INavBarItemRenderer };
export default withRouter(NavBar);

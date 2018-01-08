import TabBar from "components/tab-bar";
import * as React from "react";
import { matchPath, RouteComponentProps, withRouter } from "react-router";

interface INavBarProps extends RouteComponentProps<{}> {
    routes: INavBarRoute[];
    renderItem: (title: string, path: string, isActive: boolean) => JSX.Element;
}

interface INavBarRoute {
    exact: boolean;
    matchPath: string;
    navigateToPath: string;
    title: string;
}

class NavBar extends React.PureComponent<INavBarProps> {
    public render() {
        const tabs = this.props.routes.map((route) => {
            const { matchPath: pathToMatch, navigateToPath, exact, title } =
                route;
            const match = matchPath(
                this.props.location.pathname, { path: pathToMatch, exact });
            const isActive = match != null;
            return this.props.renderItem(title, navigateToPath, isActive);
        });
        return <TabBar onSelect={this.onSelect}>{tabs}</TabBar>;
    }

    private onSelect = (path: string) => this.props.history.replace(path);
}

export { INavBarProps, INavBarRoute };
export default withRouter(NavBar);

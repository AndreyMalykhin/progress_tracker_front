import NavBar, { INavBarRoute } from "components/nav-bar";
import TabBar from "components/tab-bar";
import * as React from "react";

interface IGlobalNavProps {
    routes: INavBarRoute[];
}

class GlobalNav extends React.Component<IGlobalNavProps> {
    public render() {
        return <NavBar {...this.props} renderItem={this.renderItem} />;
    }

    private renderItem = (title: string, path: string, isActive: boolean) => {
        return (
            <TabBar.Item key={path} id={path} active={isActive}>
                <TabBar.ItemTitle>{title}</TabBar.ItemTitle>
            </TabBar.Item>
        );
    }
}

export { IGlobalNavProps };
export default GlobalNav;

import NavBar, { INavBarProps, INavBarRoute } from "components/nav-bar";
import TabBar from "components/tab-bar";
import * as React from "react";

interface IProfileNavProps {
    routes: INavBarRoute[];
}

class ProfileNav extends React.Component<IProfileNavProps> {
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

export default ProfileNav;

import NavBar, {
    INavBarItem,
    INavBarItemRenderer,
    INavBarProps,
} from "components/nav-bar";
import TabBar, { TabBarItem, TabBarItemTitle } from "components/tab-bar";
import * as React from "react";

interface IProfileNavProps {
    items: INavBarItem[];
}

class ProfileNav extends React.Component<IProfileNavProps> {
    public render() {
        return (
            <NavBar
                keepState={true}
                renderItem={this.renderItem}
                {...this.props}
            />
        );
    }

    private renderItem: INavBarItemRenderer = (path, isActive, title, icon) => {
        return (
            <TabBarItem key={path} id={path} active={isActive}>
                <TabBarItemTitle msgId={title!} />
            </TabBarItem>
        );
    }
}

export { IProfileNavProps };
export default ProfileNav;

import NavBar, {
    INavBarItem,
    INavBarItemRenderer,
    INavBarProps,
} from "components/nav-bar";
import TabBar from "components/tab-bar";
import * as React from "react";

interface IProfileNavProps {
    items: INavBarItem[];
}

class ProfileNav extends React.Component<IProfileNavProps> {
    public render() {
        return <NavBar {...this.props} renderItem={this.renderItem} />;
    }

    private renderItem: INavBarItemRenderer = (path, isActive, title, icon) => {
        return (
            <TabBar.Item key={path} id={path} active={isActive}>
                <TabBar.ItemTitle msgId={title!} />
            </TabBar.Item>
        );
    }
}

export { IProfileNavProps };
export default ProfileNav;

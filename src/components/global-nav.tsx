import NavBar, { INavBarItem, INavBarItemRenderer } from "components/nav-bar";
import TabBar from "components/tab-bar";
import * as React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface IGlobalNavProps {
    items: INavBarItem[];
}

class GlobalNav extends React.Component<IGlobalNavProps> {
    public render() {
        return <NavBar {...this.props} renderItem={this.renderItem} />;
    }

    private renderItem: INavBarItemRenderer = (path, isActive, title, icon) => {
        return (
            <TabBar.Item key={path} id={path} active={isActive}>
                <TabBar.ItemIcon component={Icon} name={icon!} />
                <TabBar.ItemTitle msgId={title!} />
            </TabBar.Item>
        );
    }
}

export { IGlobalNavProps };
export default GlobalNav;

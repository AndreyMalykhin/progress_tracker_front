import HomePage from "components/home-page";
import IntroPageContainer from "components/intro-page-container";
import * as React from "react";
import { Redirect, Route, Switch } from "react-router";

interface ILayoutProps {
    showIntro?: boolean;
}

class Layout extends React.Component<ILayoutProps> {
    public render() {
        return (
            <Switch>
                <Route render={this.renderHomePage}/>
            </Switch>
        );
    }

    private renderHomePage = () => {
        return this.props.showIntro ? <IntroPageContainer /> : <HomePage />;
    }
}

export { ILayoutProps };
export default Layout;

import LayoutContainer from "components/layout-container";
import Loader from "components/loader";
import Text from "components/text";
import { History } from "history";
import * as React from "react";
import { IntlProvider } from "react-intl";
import { Router } from "react-router";
import QueryStatus from "utils/query-status";

interface IAppProps {
    history: History;
    locale: string;
    messages: { [id: string]: string };
}

class App extends React.Component<IAppProps> {
    public render() {
        const { locale, messages } = this.props;
        return (
            <IntlProvider
                locale={locale}
                textComponent={Text}
                messages={messages}
            >
                <Router history={this.props.history}>
                    <LayoutContainer />
                </Router>
            </IntlProvider>
        );
    }
}

export { IAppProps };
export default App;

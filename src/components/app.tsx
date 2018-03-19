import ErrorHandler from "components/error-handler";
import LayoutContainer from "components/layout-container";
import Loader from "components/loader";
import Text from "components/text";
import { History } from "history";
import * as React from "react";
import { IntlProvider } from "react-intl";
import { StyleSheet, View } from "react-native";
import { Router } from "react-router";
import formats from "utils/formats";
import makeLog from "utils/make-log";
import QueryStatus from "utils/query-status";

interface IAppProps {
    history: History;
    locale: string;
    messages: { [id: string]: string };
}

const log = makeLog("app");

class App extends React.PureComponent<IAppProps> {
    public render() {
        log.trace("render()");
        const { locale, messages } = this.props;
        return (
            <IntlProvider
                locale={locale}
                textComponent={Text}
                messages={messages}
                formats={formats}
            >
                <Router history={this.props.history}>
                    <View style={styles.content}>
                        <LayoutContainer />
                        <ErrorHandler />
                    </View>
                </Router>
            </IntlProvider>
        );
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
});

export { IAppProps };
export default App;

import LayoutContainer from "components/layout-container";
import Loader from "components/loader";
import * as React from "react";
import { IntlProvider } from "react-intl";
import { Text } from "react-native";
import { NativeRouter } from "react-router-native";
import QueryStatus from "utils/query-status";

interface IAppProps {
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
                <NativeRouter>
                    <LayoutContainer />
                </NativeRouter>
            </IntlProvider>
        );
    }
}

export { IAppProps };
export default App;

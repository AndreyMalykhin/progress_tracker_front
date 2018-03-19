import { login } from "actions/login-action";
import { addGenericErrorToast, addToast } from "actions/toast-helpers";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { ErrorHandler as ApolloErrorHandler } from "apollo-link-error";
import { ToastSeverity } from "components/toast";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import { throttle } from "lodash";
import * as React from "react";
import { compose } from "react-apollo";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { Alert } from "react-native";
import makeLog from "utils/make-log";
import { IOfflineLinkOperationContext } from "utils/offline-link";

interface IErrorHandlerProps extends IWithDIContainerProps, InjectedIntlProps {}

interface IOperationContext extends IOfflineLinkOperationContext {
    response: Response;
}

const log = makeLog("error-handler");

class ErrorHandler extends React.PureComponent<IErrorHandlerProps> {
    public constructor(props: IErrorHandlerProps, context: any) {
        super(props, context);
        this.goOffline = throttle(this.goOffline,
            props.diContainer.envConfig.pingPeriod, { trailing: false });
        this.refreshAccessToken = throttle(
            this.refreshAccessToken, 32000, { trailing: false });
    }

    public render() {
        return null;
    }

    public componentWillMount() {
        this.props.diContainer.errorLink.subscribe(this.onError);
    }

    private onError: ApolloErrorHandler = (error) => {
        log.error("onError(); error=%o", error);
        const { networkError, operation, response } = error;
        const { isOfflineOperation, response: httpResponse } =
            operation.getContext() as IOperationContext;
        const httpResponse2: Response | undefined =
            networkError && (networkError as any).response;
        const status = (httpResponse && httpResponse.status)
            || (httpResponse2 && httpResponse2.status);
        const { apollo } = this.props.diContainer;

        if (status === 401) {
            this.refreshAccessToken(apollo);
            return;
        }

        if (networkError) {
            this.goOffline(apollo);
            return;
        }

        if (!isOfflineOperation) {
            addGenericErrorToast(apollo);
        }
    }

    private goOffline = (apollo: ApolloClient<NormalizedCacheObject>) => {
        this.props.diContainer.networkTracker.setOnline(false);
        addToast(
            { msgId: "common.offline", severity: ToastSeverity.Danger },
            apollo,
        );
    }

    private refreshAccessToken = (
        apollo: ApolloClient<NormalizedCacheObject>,
    ) => {
        this.doRefreshAccessToken(apollo);
    }

    private doRefreshAccessToken =
        async (apollo: ApolloClient<NormalizedCacheObject>,
    ) => {
        log.trace("refreshAccessToken()");
        const { formatMessage } = this.props.intl;
        const title = formatMessage({ id: "refreshSession.msg" });
        const msg = undefined;
        Alert.alert(title, msg, [
            {
                onPress: async () => {
                    const isRefreshingAccessToken = true;
                    const isSuccess =
                        await login(apollo, isRefreshingAccessToken);

                    if (!isSuccess) {
                        await this.doRefreshAccessToken(apollo);
                    }
                },
                text: formatMessage({ id: "common.ok" }),
            },
        ], { cancelable: false });
    }
}

export default compose(injectIntl, withDIContainer)(ErrorHandler);

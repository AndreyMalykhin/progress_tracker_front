import { share } from "actions/share-action";
import { addGenericErrorToast } from "actions/toast-helpers";
import { isApolloError } from "apollo-client/errors/ApolloError";
import FriendsSection from "components/friends-section";
import { HeaderAnimation } from "components/header";
import withDIContainer, {
    IWithDIContainerProps,
} from "components/with-di-container";
import withHeader, { IWithHeaderProps } from "components/with-header";
import withSession, { IWithSessionProps } from "components/with-session";
import * as React from "react";
import { compose, withApollo } from "react-apollo";
import graphql from "react-apollo/graphql";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import IconName from "utils/icon-name";
import { IWithApolloProps } from "utils/interfaces";

interface IFriendsSectionContainerProps extends
    IWithHeaderProps,
    IWithSessionProps,
    IWithApolloProps,
    InjectedIntlProps,
    IWithDIContainerProps {}

class FriendsSectionContainer extends
    React.Component<IFriendsSectionContainerProps> {
    public render() {
        return <FriendsSection />;
    }

    public componentWillMount() {
        this.updateHeader(this.props);
    }

    public componentWillReceiveProps(nextProps: IFriendsSectionContainerProps) {
        if (nextProps.header.isEmpty()
            || this.props.session.accessToken !== nextProps.session.accessToken
        ) {
            this.updateHeader(nextProps);
        }
    }

    private updateHeader(props: IFriendsSectionContainerProps) {
        const title = props.intl.formatMessage(
            { id: "globalNavigation.friends" });
        props.header.replace({
            animation: HeaderAnimation.FadeInRight,
            key: "friendsSectionContainer.index",
            rightCommands: [
                {
                    iconName: IconName.Add,
                    isDisabled: !props.session.accessToken,
                    msgId: "commands.share",
                    onRun: this.onInvite,
                },
            ],
            title,
        });
    }

    private onInvite = async () => {
        const { intl, client, diContainer } = this.props;

        try {
            await share("share.app", intl);
        } catch (e) {
            if (!isApolloError(e)) {
                addGenericErrorToast(client);
            }
        }
    }
}

export default compose(
    withHeader,
    withDIContainer,
    withSession,
    withApollo,
    injectIntl,
)(FriendsSectionContainer);

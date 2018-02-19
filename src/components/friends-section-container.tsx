import { inviteFriends } from "actions/invite-friends-action";
import { addGenericErrorToast, addToast } from "actions/toast-helpers";
import FriendsSection from "components/friends-section";
import withHeader, { IWithHeaderProps } from "components/with-header";
import withSession, { IWithSessionProps } from "components/with-session";
import * as React from "react";
import { compose, withApollo } from "react-apollo";
import graphql from "react-apollo/graphql";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import IconName from "utils/icon-name";
import { IWithApolloProps } from "utils/interfaces";

interface IFriendsSectionContainerProps extends
    IWithHeaderProps, IWithSessionProps, IWithApolloProps, InjectedIntlProps {}

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
        props.header.replace({
            rightCommands: [
                {
                    iconName: IconName.Add,
                    isDisabled: !props.session.accessToken,
                    msgId: "commands.share",
                    onRun: this.onInvite,
                },
            ],
            title: <FormattedMessage id="globalNavigation.friends" />,
        });
    }

    private onInvite = async () => {
        const msg = this.props.intl.formatMessage({ id: "friends.inviteMsg" });
        const hashtag = this.props.intl.formatMessage({ id: "common.brand" });

        try {
            await inviteFriends(msg, hashtag);
        } catch (e) {
            addGenericErrorToast(this.props.client);
        }
    }
}

export default compose(
    withHeader,
    withSession,
    withApollo,
    injectIntl,
)(FriendsSectionContainer);

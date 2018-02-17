import { inviteFriends } from "actions/invite-friends-action";
import FriendsSection from "components/friends-section";
import withHeader, { IWithHeaderProps } from "components/with-header";
import withSession, { IWithSessionProps } from "components/with-session";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import IconName from "utils/icon-name";

interface IFriendsSectionContainerProps extends
    IWithHeaderProps, IWithSessionProps, InjectedIntlProps {}

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

    private onInvite = () => {
        const msg = this.props.intl.formatMessage({ id: "friends.inviteMsg" });
        const hashtag = this.props.intl.formatMessage({ id: "common.brand" });
        inviteFriends(msg, hashtag);
    }
}

export default compose(
    withHeader,
    withSession,
    injectIntl,
)(FriendsSectionContainer);

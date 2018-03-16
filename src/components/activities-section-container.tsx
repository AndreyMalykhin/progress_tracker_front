import ActivitiesSection from "components/activities-section";
import { HeaderAnimation } from "components/header";
import { INavBarItem } from "components/nav-bar";
import Text from "components/text";
import withHeader, { IWithHeaderProps } from "components/with-header";
import Audience from "models/audience";
import * as React from "react";
import { compose } from "react-apollo";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import { RouteComponentProps } from "react-router";
import routes from "utils/routes";

interface IRouteParams {
    audience: Audience;
}

interface IActivitiesSectionContainerProps extends
    IWithHeaderProps, RouteComponentProps<IRouteParams>, InjectedIntlProps {}

const friendsAudienceRoute =
    routes.activities.path.replace(":audience", Audience.Friends);
const myAudienceRoute =
    routes.activities.path.replace(":audience", Audience.Me);
const navItems: INavBarItem[] = [
    {
        matchExact: routes.activities.exact,
        matchPath: friendsAudienceRoute,
        navigateToPath: friendsAudienceRoute,
        titleMsgId: "activitiesNavigation.friends",
    },
    {
        matchExact: routes.activities.exact,
        matchPath: myAudienceRoute,
        navigateToPath: myAudienceRoute,
        titleMsgId: "activitiesNavigation.my",
    },
];

class ActivitiesSectionContainer extends
    React.Component<IActivitiesSectionContainerProps> {
    public render() {
        return (
            <ActivitiesSection
                audience={this.props.match.params.audience}
                navItems={navItems}
            />
        );
    }

    public componentWillMount() {
        this.updateHeader(this.props);
    }

    public componentWillReceiveProps(
        nextProps: IActivitiesSectionContainerProps,
    ) {
        if (nextProps.header.isEmpty()) {
            this.updateHeader(nextProps);
        }
    }

    private updateHeader(props: IActivitiesSectionContainerProps) {
        const title = props.intl.formatMessage(
            { id: "globalNavigation.activities" });
        props.header.replace({
            animation: HeaderAnimation.FadeInRight,
            key: "activitiesSectionContainer.index",
            title,
        });
    }
}

export default compose(withHeader, injectIntl)(ActivitiesSectionContainer);

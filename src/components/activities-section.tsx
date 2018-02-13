import ActivityListContainer from "components/activity-list-container";
import { INavBarItem } from "components/nav-bar";
import SecondaryNav from "components/secondary-nav";
import Audience from "models/audience";
import * as React from "react";
import { StyleSheet, View } from "react-native";

interface IActivitiesSectionProps {
    navItems: INavBarItem[];
    audience: Audience;
}

class ActivitiesSection extends React.Component<IActivitiesSectionProps> {
    public render() {
        const { audience, navItems } = this.props;
        return (
            <View style={styles.container}>
                <SecondaryNav items={navItems} />
                <View style={styles.content}>
                    <ActivityListContainer key={audience} audience={audience} />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});

export default ActivitiesSection;

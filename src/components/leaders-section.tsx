import { listStyle, shadeColor } from "components/common-styles";
import LeaderListContainer from "components/leader-list-container";
import { INavBarItem } from "components/nav-bar";
import SecondaryNav from "components/secondary-nav";
import Audience from "models/audience";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

interface IActivitiesSectionProps {
    navItems: INavBarItem[];
    audience: Audience;
}

class LeadersSection extends React.Component<IActivitiesSectionProps> {
    public render() {
        const { audience, navItems } = this.props;
        return (
            <View style={styles.container}>
                <SecondaryNav items={navItems} style={styles.nav} />
                <View style={styles.content}>
                    <LeaderListContainer key={audience} audience={audience} />
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
        backgroundColor: listStyle.backgroundColor,
        flex: 1,
    },
    nav: {
        backgroundColor: shadeColor.light2,
    },
});

export default LeadersSection;

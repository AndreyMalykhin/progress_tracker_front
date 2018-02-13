import { INavBarItem } from "components/nav-bar";
import PendingReviewTrackableListContainer from "components/pending-review-trackable-list-container";
import SecondaryNav from "components/secondary-nav";
import Audience from "models/audience";
import * as React from "react";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface IPendingReviewSectionProps {
    navItems: INavBarItem[];
    audience: Audience;
}

class PendingReviewSection extends React.Component<IPendingReviewSectionProps> {
    public render() {
        const { audience, navItems } = this.props;
        return (
            <View style={styles.container}>
                <SecondaryNav items={navItems} />
                <View style={styles.content}>
                    <PendingReviewTrackableListContainer
                        key={audience}
                        audience={audience}
                    />
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

export { IPendingReviewSectionProps };
export default PendingReviewSection;

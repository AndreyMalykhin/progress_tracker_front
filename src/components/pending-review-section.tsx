import { INavBarItem } from "components/nav-bar";
import PendingReviewNav from "components/pending-review-nav";
import PendingReviewTrackableListContainer from "components/pending-review-trackable-list-container";
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
                <PendingReviewNav items={navItems} />
                <View style={styles.content}>
                    <PendingReviewTrackableListContainer audience={audience} />
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

import ArchiveNav from "components/archive-nav";
import { INavBarItem } from "components/nav-bar";
import TrackableStatus from "models/trackable-status";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router";
import ArchivedTrackableListContainer from "./archived-trackable-list-container";

interface IArchiveProps {
    navItems: INavBarItem[];
    trackableStatus: TrackableStatus;
    userId: string;
}

class Archive extends React.Component<IArchiveProps> {
    public render() {
        const { userId, navItems, trackableStatus } = this.props;
        return (
            <View style={styles.container}>
                <ArchiveNav items={navItems} />
                <View style={styles.content}>
                    <ArchivedTrackableListContainer
                        userId={userId}
                        trackableStatus={trackableStatus}
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

export default Archive;

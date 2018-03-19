import { listStyle } from "components/common-styles";
import FriendListContainer from "components/friend-list-container";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

class FriendsSection extends React.Component {
    public render() {
        return (
            <View style={styles.container}>
                <FriendListContainer />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: listStyle.backgroundColor,
        flex: 1,
    },
});

export default FriendsSection;

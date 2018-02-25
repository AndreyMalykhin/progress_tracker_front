import Button, { ButtonTitle } from "components/button";
import Text from "components/text";
import { IWithRefreshProps } from "components/with-refresh";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, View } from "react-native";

type IEmptyListProps = Partial<IWithRefreshProps>;

class EmptyList extends React.Component<IEmptyListProps> {
    public render() {
        const { isRefreshing, onRefresh } = this.props;
        const refreshBtn = onRefresh != null && (
            <Button loading={isRefreshing} onPress={onRefresh}>
                <ButtonTitle msgId="common.refresh" />
            </Button>
        );
        return (
            <View style={styles.container}>
                <Text style={styles.msg}>
                    <FormattedMessage id="common.noData" />
                </Text>
                {refreshBtn}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    msg: {
        lineHeight: 32,
    },
});

export default EmptyList;

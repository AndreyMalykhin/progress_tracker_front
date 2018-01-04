import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql, QueryProps } from "react-apollo";
import { Text, View } from "react-native";
import { Link } from "react-router-native";

class Home extends React.Component<IProps, {}> {
    public render() {
        const { loading, error, Starship } = this.props.data;
        return (
            <View>
                <Text>{!loading && Starship.name}</Text>
                <Text>Open up App.js to start working on your app!</Text>
                <Text>Changes you make will automatically reload.</Text>
                <Text>Shake your phone to open the developer menu.</Text>
                <Link to="/hello">
                    <Text style={{ color: "blue" }}>Hello</Text>
                </Link>
            </View>
        );
    }
}

const MY_QUERY = gql`
query GetStarship($id: ID!) {
    Starship(id: $id) {
        name
        hyperdriveRating
    }
}`;

interface IResponse {
    Starship: {
        name: string;
        hyperdriveRating: number;
    };
}

interface IProps {
    data: QueryProps & IResponse;
}

export default graphql<IResponse, {}, IProps>(MY_QUERY, {
    options: {
        variables: { id: "cj0nwtqpzq4tt01142nh7e9i4" },
    },
})(Home);

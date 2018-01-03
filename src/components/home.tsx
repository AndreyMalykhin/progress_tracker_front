import * as React from "react";
import { Text, View } from "react-native";
import { Link } from "react-router-native";

class Home extends React.Component {
    public render() {
        return (
            <View>
                <Text>Open up App.js to start working on your app!</Text>
                <Text>Changes you make will automatically reload.</Text>
                <Text>Shake your phone to open the developer menu.</Text>
                <Link to="/hello">
                    <Text style={{color: "blue"}}>Hello</Text>
                </Link>
            </View>
        );
    }
}

export default Home;

import { StyleSheet, Text, View } from "react-native";
import HallList from "./HallList";


function HallsOutput({ halls, fallbackText }) {
    let content = <Text style={styles.infoText}>{fallbackText}</Text>;

    if (halls.length > 0) {
        content = <HallList items={halls} />;
    }

    return (
        <View style={styles.container}>
            {content}
        </View>
    );
}

export default HallsOutput;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 0,
    },
    infoText: {
        color: "black",
        fontSize: 16,
        textAlign: "center",
        marginTop: 32,
    },
});

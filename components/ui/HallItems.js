import {Image, Platform, Pressable, StyleSheet, Text, View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

function HallItems({
                       id,
                       name,
                       imageUrl,
                       location,
                       phoneNumber,
                       services,
                       capacity,
                       description,
                       categories
                   }) {
    const nav = useNavigation();

    function pressHandler() {
        nav.navigate("details", {
            id,
            name,
            imageUrl,
            location,
            phoneNumber,
            services,
            description,
            categories
        });
    }

    function iconPress() {
        console.log("Icon pressed");
    }

    // Join services into a single string with commas
    const servicesList = Object.entries(services)
        .map(([key, value]) => `${key}`)
        .join(", ");

    return (
        <View style={styles.mealItem}>
            <Pressable
                android_ripple={{color: "#ccc"}}
                style={({pressed}) => (pressed ? styles.buttonPressed : null)}
                onPress={pressHandler}
            >
                <View>
                    <View style={styles.innerContainer}>
                        <Image source={{uri: imageUrl}} style={styles.image}/>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{name}</Text>
                            <Text style={styles.icon}>
                                {capacity}{" "}
                                <Icon
                                    onPress={iconPress}
                                    name={"person"}
                                    size={20}
                                    color={"black"}
                                />
                            </Text>
                        </View>
                    </View>
                    <View style={styles.innerContainer}>
                        <Text>Services: {servicesList}</Text>
                        <Text>Location: {location}</Text>
                        <Text>Phone Number: {phoneNumber}</Text>
                    </View>
                </View>
            </Pressable>
        </View>
    );
}

export default HallItems;

const styles = StyleSheet.create({
    mealItem: {
        marginBottom: 20,
        borderRadius: 10,
        overflow: Platform.OS === "android" ? "hidden" : "visible",
        backgroundColor: "white",
        elevation: 6,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 8,
    },
    innerContainer: {
        borderRadius: 8,
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: 200,
    },
    title: {
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
        flex: 1,
        marginLeft: 30,
    },
    textContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    buttonPressed: {
        opacity: 0.5,
    },
    icon: {},
});

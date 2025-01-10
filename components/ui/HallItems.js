import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons"; // For star icons

function HallItems({
                       id,
                       name,
                       imageUrl,
                       location,
                       phoneNumber,
                       services,
                       capacity,
                       description,
                       categories,
                       longitude,
                       latitude,
                       averageRating,
                       HallRatings,
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
            categories,
            longitude,
            latitude,
            HallRatings,
        });
    }

    // Helper function to calculate price range
    const calculatePriceRange = (categories, services) => {
        if (!categories || Object.keys(categories).length === 0) {
            return "N/A"; // No categories, return N/A
        }

        const categoryPrices = Object.values(categories);
        const lowestCategoryPrice = Math.min(...categoryPrices);
        const highestCategoryPrice = Math.max(...categoryPrices);

        const serviceCosts = services
            ? Object.values(services).reduce((sum, cost) => sum + parseFloat(cost || 0), 0)
            : 0;

        const totalHighestPrice = highestCategoryPrice + serviceCosts;

        return `${lowestCategoryPrice} - ${totalHighestPrice}`;
    };

    // Get the first image URL directly
    const firstImageUrl = imageUrl?.split(",")[0]?.trim() || null;

    // Calculate price range
    const priceRange = calculatePriceRange(categories, services);

    // Render stars for the rating
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FontAwesome
                    key={i}
                    name="star"
                    size={16}
                    color={i <= averageRating ? "#cba36b" : "#ccc"}
                    style={styles.star}
                />
            );
        }
        return stars;
    };

    return (
        <View style={styles.hallItem}>
            <Pressable
                android_ripple={{ color: "#ccc" }}
                style={({ pressed }) => (pressed ? styles.buttonPressed : null)}
                onPress={pressHandler}
            >
                <View>
                    {/* Hall Image */}
                    {firstImageUrl ? (
                        <Image source={{ uri: firstImageUrl }} style={styles.image} />
                    ) : (
                        <View style={styles.noImageContainer}>
                            <Text style={styles.noImageText}>No Image Available</Text>
                        </View>
                    )}

                    {/* Hall Details */}
                    <View style={styles.detailsContainer}>
                        {/* Name */}
                        <Text style={styles.title}>{name}</Text>

                        {/* Price */}
                        <Text style={styles.price}>{priceRange}</Text>
                        <Text style={styles.perDay}>per day</Text>

                        {/* Rating */}
                        <View style={styles.ratingContainer}>{renderStars()}</View>
                    </View>

                    {/* Footer: Location and Capacity */}
                    <View style={styles.footer}>
                        <View style={styles.footerItem}>
                            <Icon name="location-outline" size={16} color="#555" />
                            <Text style={styles.footerText}>{location}</Text>
                        </View>
                        <View style={styles.footerItem}>
                            <Icon name="person" size={16} color="#555" />
                            <Text style={styles.footerText}>{capacity}</Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        </View>
    );
}

export default HallItems;

const styles = StyleSheet.create({
    hallItem: {
        marginBottom: 20,
        borderRadius: 10,
        overflow: Platform.OS === "android" ? "hidden" : "visible",
        backgroundColor: "white",
        elevation: 6,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },
    image: {
        width: "100%",
        height: 200,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    noImageContainer: {
        width: "100%",
        height: 200,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    noImageText: {
        fontSize: 14,
        color: "#888",
    },
    detailsContainer: {
        padding: 16,
        alignItems: "center",
    },
    title: {
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
        marginBottom: 8,
        color: "#cba36b",
    },
    price: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#cba36b",
    },
    perDay: {
        fontSize: 12,
        color: "#888",
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    star: {
        marginHorizontal: 2,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    footerItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    footerText: {
        marginLeft: 4,
        fontSize: 14,
        color: "#555",
    },
    buttonPressed: {
        opacity: 0.5,
    },
});
